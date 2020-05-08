const dataURL = '__BASE_DOMAIN__/api/v1/data/';
const randomProbeURL = '__BASE_DOMAIN__/api/v1/probes/random/';

// We could eventually make a constants.js, this is low priority.
const FETCH_ERROR_MESSAGES = {
  code5xx: 'Oh no! The server encountered an error.',
  code4xx: 'Oh no! Your client sent an invalid request.',
  code404: '404: No data found for the selected dimensions.',
  code405: '405: Method not allowed.',
};

export async function getRandomProbes(numProbes, process) {
  const data = await fetch(randomProbeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ n: numProbes, process }),
  }).then((response) => response.json());
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
