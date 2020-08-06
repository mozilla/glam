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
        di.data = JSON.parse(di.data);
      });
      return d;
    });
  return data;
}

export async function getProbeData(params, token) {
  const data = await fetch(dataURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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

export function getSearchResults(
  queryString,
  exactSearch = false,
  resultsLimit = DEFAULT_SEARCH_RESULTS_LIMIT
) {
  const getFormattedSearchURL = (str, product = 'desktop') => {
    const URLResult = new URL('__BASE_SEARCH_DOMAIN__');
    const strFragments = str.split(/\s+/);

    const params = new URLSearchParams();
    const queryOptions = [];
    const stringScalars =
      '(type.eq.scalar,info->calculated->latest_history->details->>kind.eq.string)';

    queryOptions.push(`name.eq.${str}`);
    if (!exactSearch) {
      queryOptions.push(`search.plfts(simple).${str}`);
      queryOptions.push(`description.phfts(english).${str}`);
      queryOptions.push(
        `name.ilike.*${
          strFragments.length ? strFragments[strFragments.length - 1] : str
        }*`
      );
    }

    params.set('limit', resultsLimit);
    params.set('select', 'name,description,type,info');
    params.set('type', 'neq.event');
    params.set('or', `(${queryOptions.join(',')})`);
    params.set('not.and', stringScalars);

    if (product === 'desktop') {
      URLResult.pathname = 'telemetry'; // hint: change this to test 404 error case
    } else {
      URLResult.pathname = 'glean';
      params.set('product', `eq.${product}`);
    }

    URLResult.search = params;

    return URLResult;
  };

  return fetch(getFormattedSearchURL(queryString)).then((r) => {
    if (r.ok) return r.json(); // everything is fine
    return r; // fetch error - send the error object
  });
}
