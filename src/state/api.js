const dataURL = '__BASE_DOMAIN__/api/v1/data/';
const randomProbeURL = '__BASE_DOMAIN__/api/v1/probes/random/';

// We could eventually make a constants.js, this is low priority.
const FETCH_ERROR_MESSAGES = {
  code5xx: 'Oh no! The server encountered an error.',
  code4xx: 'Oh no! Your client sent an invalid request.',
  code404: '404: No data found for the selected dimensions.',
  code405: '405: Method not allowed.',
};

const DEFAULT_SEARCH_RESULTS_LIMIT = 30; // maximum number of results to show

export async function getRandomProbes(numProbes, process) {
  const data = await fetch(randomProbeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ n: numProbes, process }),
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

function getFormattedSearchURL(
  queryString,
  exactSearch,
  product,
  resultsLimit
) {
  const URLResult = new URL('__BASE_SEARCH_DOMAIN__');

  const params = new URLSearchParams();
  const queryOptions = [];
  const stringScalars =
    '(type.eq.scalar,info->calculated->latest_history->details->>kind.eq.string)';

  queryOptions.push(`name.eq.${queryString}`);
  if (!exactSearch) {
    queryOptions.push(`search.plfts(simple).${queryString}`);
    queryOptions.push(`description.phfts(english).${queryString}`);
    queryOptions.push(`name.ilike.*${queryString.split(/\s+/).join('*')}*`);
  }

  params.set('limit', resultsLimit);
  params.set('select', 'name,description,type,info');
  params.set('type', 'neq.event');
  params.set('or', `(${queryOptions.join(',')})`);
  params.set('not.and', stringScalars);
  // Show active probes first.
  params.set('order', 'info->calculated->>active.desc');

  if (product === 'firefox') {
    URLResult.pathname = 'telemetry'; // hint: change this to test 404 error case
  } else {
    URLResult.pathname = 'glean';
    params.set('product', `eq.${product}`);
  }

  URLResult.search = params;

  return URLResult;
}

export function getSearchResults(
  queryString,
  exactSearch = false,
  product,
  resultsLimit = DEFAULT_SEARCH_RESULTS_LIMIT
) {
  return fetch(
    getFormattedSearchURL(queryString, exactSearch, product, resultsLimit)
  ).then((r) => {
    if (r.ok) return r.json(); // everything is fine
    return r; // fetch error - send the error object
  });
}

export function getProbeInfo(product, probeName) {
  // this method pulls from the probe search service in the case of Firefox and the
  // Glean Dictionary in the case of Fenix (can be extended to other glean products
  // in the future).
  const useGleanDictionary = product === 'fenix';

  const url = useGleanDictionary
    ? `__GLEAN_DICTIONARY_DOMAIN__/data/${product}/metrics/data_${probeName}.json`
    : getFormattedSearchURL(probeName, true, product);

  return fetch(url).then((r) => {
    // the probe search service returns an array of results (one in this case),
    // whereas the Glean Dictionary returns a single JSON dictionary
    if (r.ok)
      return r.json().then((json) => (useGleanDictionary ? json : json[0]));
    return r; // fetch error - send the error object
  });
}
