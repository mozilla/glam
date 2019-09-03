// Allow console logs since this isn't in the browser.
/* eslint-disable no-console */
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const https = require('https');

try {
  admin.initializeApp();
} catch (e) {
  console.log(e);
}

const PROBES_URL =
  'https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes';
const VERSIONS_URL =
  'https://product-details.mozilla.org/1.0/firefox_versions.json';


/**
 * General HTTPS getter method.
 */
function getJSONContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      if (resp.statusCode < 200 || resp.statusCode > 299) {
        reject(new Error(`Failed to load resource: ${resp.statusCode}`))
      }
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('JSON Parse error'));
        }
      });
    })
    .on('error', (e) => {
      reject(new Error(e.message));
    });
  });
}

/**
 * Store the probe document in the Firestore db.
 */
async function storeProbe(key, probe) {
  const db = admin.firestore();

  return db
    .collection('firefox-probes')
    .doc(key.replace('/', '::'))
    .set(probe);
}

/**
 * Helper methods.
 */

function getFirstLastVersion(probe, channel) {
  return probe.history[channel] && [
    probe.history[channel].slice(-1)[0].versions.first,
    probe.history[channel][0].versions.last] || [null, null];
}

function getOptOut(probe, channel) {
  if (probe.history[channel]) {
    return probe.history[channel][0].optout;
  }
  return null;
}

/**
 * Cloud function to fetch probe info and store it in Firestore.
 */
// eslint-disable-next-line no-multi-assign
exports = module.exports = functions.https.onRequest((request, response) => {
  getJSONContent(VERSIONS_URL)
    .then((versions) => {
      const [nightly, ] = versions.FIREFOX_NIGHTLY.split('.');
      console.log(`Latest nightly version: ${nightly}`);

      getJSONContent(PROBES_URL)
        .then((probes) => {

          const promises = [];
          Object.keys(probes).forEach(k => {
            const probe = probes[k];
            // The most recent history object to pull representative fields from.
            const latestHistory = (
              probe.history.nightly ||
              probe.history.beta ||
              probe.history.release)[0];
            const nightlyFirstLast = getFirstLastVersion(probe, 'nightly');

            // Build document to store.
            const doc = {
              name: probe.name,
              description: latestHistory.description,
              type: probe.type,
              // Events don't have a kind.
              kind: latestHistory.details.kind || null,
              versions: {
                nightly: nightlyFirstLast,
                beta: getFirstLastVersion(probe, 'beta'),
                release: getFirstLastVersion(probe, 'release'),
              },
              optout: {
                nightly: getOptOut(probe, 'nightly'),
                beta: getOptOut(probe, 'beta'),
                release: getOptOut(probe, 'release'),
              },
              bugs: latestHistory.bug_numbers,
              // Calculated fields.
              // - active (bool): TRUE if last recorded nightly version is equal to the
              // latest nightly version.
              active: nightlyFirstLast[1] && nightlyFirstLast[1] === nightly || false,
              // - prelease (bool): TRUE if "optout" is false on the "release"
              // channel, i.e., it's recorded by default on all channels.
              prerelease: probe.history.release && probe.history.release[0].optout === false || null,
            };

            // Write to db.
            promises.push(storeProbe(k, doc));
          });

          Promise.all(promises)
            .then(() => {
              return response.status(200).send('Probes imported.');
            })
            .catch(error => {
              console.error(error);
              response.status(500).send(error.message);
            });
        })
        .catch((error) => {
          console.error(error);
          response.status(500).send(error.message);
        });
    });
});
