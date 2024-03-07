const dataURL = '__BASE_DOMAIN__/api/v1/data/';
const randomProbeURL = '__BASE_DOMAIN__/api/v1/probes/random/';

// We could eventually make a constants.js, this is low priority.
const FETCH_ERROR_MESSAGES = {
  code5xx: 'Oh no! The server encountered an error.',
  code4xx: 'Oh no! Your client sent an invalid request.',
  code404:
    '404: No data found for the selected dimensions. Try changing the filters on the top-right corner of the page and check if the probe is still active.',
  code405: '405: Method not allowed.',
};

const DEFAULT_SEARCH_RESULTS_LIMIT = 100; // maximum number of results to show

export async function getRandomProbes(numProbes, process) {
  const data = await fetch(randomProbeURL, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((d) => {
      d.probes.forEach((di) => {
        di.data = JSON.parse(di.data); // eslint-disable-line no-param-reassign
      });
      return d;
    });
  return data;
}

export async function getProbeData(params) {
  const data = await fetch(dataURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: params }),
  }).then(async (response) => {
    // Catch fetch error responses and show them in the UI.
    if (response.status >= 400 && response.status < 600) {
      const errorCode = `code${response.status}`;
      let msg = FETCH_ERROR_MESSAGES[errorCode] || '';
      if (!msg) {
        msg =
          response.status < 500
            ? FETCH_ERROR_MESSAGES.code4xx
            : FETCH_ERROR_MESSAGES.code5xx;
      }
      const error = new Error(msg);
      error.statusCode = response.status;
      throw error;
    }
    return response.json();
  });
  return data;
}

function getProbeSearchURL(productId, queryString, resultsLimit) {
  const URLResult = new URL(
    `__GLEAN_DICTIONARY_DOMAIN__/api/v1/metrics_search_${productId}`
  );

  const params = new URLSearchParams();
  params.set('search', queryString);
  params.set('glam', 1);
  params.set('limit', resultsLimit);

  URLResult.search = params;

  return URLResult;
}

export function getSearchResults(
  searchProduct,
  queryString,
  resultsLimit = DEFAULT_SEARCH_RESULTS_LIMIT
) {
  // use a "fog_and_legacy" URL which searches for old telemetry + FOG metrics
  const productId =
    searchProduct === 'firefox' ? 'fog_and_legacy' : searchProduct;
  const searchURL = getProbeSearchURL(productId, queryString, resultsLimit);

  return fetch(searchURL).then((r) => {
    if (r.ok) return r.json(); // everything is fine
    return r; // fetch error - send the error object
  });
}

export function getProbeInfo(product, probeName) {
  // this method pulls from the probe search service in the case of Firefox and the
  // Glean Dictionary in the case of Fenix (can be extended to other glean products
  // in the future).
  const productIds = {
    firefox: 'firefox_legacy',
    fog: 'firefox_desktop',
    fenix: 'fenix',
  };

  const url = `__GLEAN_DICTIONARY_DOMAIN__/data/${productIds[product]}/metrics/data_${probeName}.json`;

  return fetch(url).then((r) => {
    if (r.ok) return r.json();
    return r; // fetch error - send the error object
  });
}
