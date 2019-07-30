// Allow console logs since this isn't in the browser.
/* eslint-disable no-console */
const admin = require('firebase-admin');
const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('firebase-functions');
const https = require('https');
const { murmurHash128 } = require('murmurhash-native');

const PRODUCT_DETAILS_URL =
  'https://product-details.mozilla.org/1.0/firefox_versions.json';

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
    .set(doc)
    .catch(error => {
      console.log(error.message);
    });
}

function importAggregates(channel, version) {
  return new Promise((resolve, reject) => {
    const promises = [];
    const bigquery = new BigQuery();
    const query = `
      SELECT *
      FROM \`moz-fx-data-derived-datasets.telemetry.client_probe_counts_v1\`
      WHERE
        channel = @channel
        AND app_version = @app_version
        AND os IS NOT NULL
        AND app_build_id IS NOT NULL
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
    let count = 0;
    bigquery
      .createQueryStream(options)
      .on('error', error => {
        console.error(error);
        reject(error);
      })
      .on('data', row => {
        count += 1;
        collection = `${channel}-${version}`;
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
      })
      .on('end', () => {
        if (count === 0) {
          console.log(`No results for query ${channel}-${version}`);
          resolve(`No aggregates imported for ${channel}-${version}`);
        } else {
          Promise.all(promises)
            .then(() => {
              resolve(`${count} aggregates imported for ${channel}-${version}`);
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        }
      });
  });
}

function getMajor(version) {
  return version.split('.')[0];
}

function getLastTen(version) {
  // Return last 10 versions as array of strings, including provided version.
  // FIXME: Question: Do we need to import 10 versions ago? Or only keep 10
  // versions in the db.
  const v = parseInt(version, 10);
  return [...Array(10).keys()].map(n => `${v - n}`);
}

function getLatestVersions() {
  return new Promise((resolve, reject) => {
    https.get(PRODUCT_DETAILS_URL, res => {
      let data = '';
      res.on('data', d => {
        data += d;
      });
      res.on('end', () => {
        let j;
        try {
          j = JSON.parse(data);
        } catch (error) {
          console.error(error);
          reject(error);
        }
        const latestVersions = {
          release: getMajor(j.LATEST_FIREFOX_VERSION),
          beta: getMajor(j.LATEST_FIREFOX_DEVEL_VERSION),
          nightly: getMajor(j.FIREFOX_NIGHTLY)
        };
        console.log(latestVersions);
        resolve(latestVersions);
      });
    });
  });
}

async function run() {
  const promises = [];
  const versions = await getLatestVersions();

  Object.entries(versions).forEach(([channel, latestVersion]) => {
    getLastTen(latestVersion).forEach(version => {
      console.log(`Calling importAggregates with (${channel}, ${version})`);
      promises.push(importAggregates(channel, version));
    });
  });

  return Promise.all(promises);
}

// eslint-disable-next-line no-multi-assign
exports = module.exports = functions.https.onRequest((request, response) => {
  run()
    .then(results => {
      console.log(results);
      response.status(200).send('All aggregates imported.');
    })
    .catch(error => {
      console.log(error.message);
      response.status(500).send(`Error: ${error.message}`);
    });
});
