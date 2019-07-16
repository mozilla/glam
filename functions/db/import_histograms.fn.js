// Allow console logs since this isn't in the browser.
/* eslint-disable no-console */
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('firebase-functions');
const { murmurHash128 } = require('murmurhash-native');

try {
  admin.initializeApp();
} catch (e) {
  console.log(e);
}

async function writeDoc(collection, docId, doc) {
  const db = admin.firestore();

  return db
    .collection(collection)
    .doc(docId)
    .set(doc);
}

function importAggregates(channel, version) {
  return new Promise((resolve, reject) => {
    const promises = [];
    const bigquery = new BigQuery();
    const query = `
      SELECT *
      FROM \`moz-fx-data-derived-datasets.analysis.client_probe_counts\`
      WHERE
        channel = @channel
        AND app_version = @app_version
    `;
    const options = {
      query,
      params: {
        channel,
        app_version: version
      }
    };
    let collection = null;
    let docId = null;
    let doc = null;
    bigquery
      .createQueryStream(options)
      .on('error', error => {
        console.error(error);
        reject(error);
      })
      .on('data', row => {
        collection = `${row.channel}-${row.app_version.split('.')[0]}`;
        // Hash the dimensions to create a unique reproducible doc ID.
        // See: https://softwareengineering.stackexchange.com/a/145633 on the
        // choice of hashing function.
        docId = murmurHash128(
          `${row.metric}-${row.app_build_id}-${row.os}-${row.agg_type}`
        );
        doc = {
          metric: row.metric,
          build_id: row.app_build_id,
          os: row.os,
          agg_type: row.agg_type,
          aggregates: row.aggregates.key_value
        };
        promises.push(writeDoc(collection, docId, doc));
        console.log(`Pushed a promise: ${docId}`);
      })
      .on('end', () => {
        console.log('End streaming query');
        Promise.all(promises)
          .then(() => {
            resolve(`Aggregates imported for ${channel}-${version}`);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      });
  });
}

// eslint-disable-next-line no-multi-assign
exports = module.exports = functions.https.onRequest((request, response) => {
  // TODO: Get latest version info and iterate over all combinations of the
  // last 10 versions + 3 channels.
  importAggregates('release', '65.0').then((results) => {
    console.log(results);
    response.status(200).send('Aggregates imported');
  })
  .catch(error => {
    console.log(error.message);
    response.status(500).send(`Error: ${error.message}`);
  });
});
