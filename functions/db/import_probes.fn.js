'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const https = require("https");

try { admin.initializeApp() } catch (e) { console.log(e) }


const PROBE_INFO_URL = "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes";


/**
 * Cloud function to fetch probe info and store it in Firestore.
 */
exports = module.exports = functions.https.onRequest((request, response) => {
  
  https.get(PROBE_INFO_URL, (res) => {
      console.log(res.headers);
      console.log(res.statusCode);

      let data = "";
      let probe = null;

      res.on("data", (d) => {
        data += d;
      });

      res.on("end", () => {
        try {
          var j = JSON.parse(data);
        } catch (e) {
          console.error(e);
          response.status(500).send(error.message);
        }

        const promises = [];
        Object.keys(j).forEach(k => {
          // Build object.
          probe = {
            name: j[k].name,
            type: j[k].type,
            description: (
              j[k].history.nightly ||
              j[k].history.beta ||
              j[k].history.release)[0].description
          };
          // Write to db.
          promises.push(storeProbe(k, probe));
        });

        Promise.all(promises).then(values => {
          return response.status(200).send("Probes imported.");
        })
        .catch(error => {
          console.error(error);
          response.status(500).send(error.message);
        });

      });
  }).on("error", (e) => {
      console.error(e.message);
      response.status(500).send(e.message);
  });
});

/**
 * Store the probe document in the Firestore db.
 */
async function storeProbe(key, probe) {
  const db = admin.firestore();

  key = key.replace("/", "::");
  return db.collection("firefox-probes").doc(key).set(probe);
}
