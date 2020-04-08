const dataURL = '__BASE_DOMAIN__/api/v1/data/';
const randomProbeURL = '__BASE_DOMAIN__/api/v1/probes/random/';

// We could eventually make a constants.js, this is low priority.
const FETCH_ERROR_MESSAGES = {
  code5xx: 'Oh no! The server encountered an error.',
  code4xx: 'Oh no! Your client sent an invalid request.',
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
    // catch fetch error responses and surface them into
    // the frontend.
    if (response.status >= 400 && response.status < 600) {
      const msg =
        response.status < 500
          ? FETCH_ERROR_MESSAGES.code4xx
          : FETCH_ERROR_MESSAGES.code5xx;
      const e = new Error(msg);
      const txt = await response.text();
      e.moreInformation = `GLAM encountered a problem trying to show ${
        params.probe
      }, so we'll
      report the error here: 
      ${txt.split('\n').slice(0, 2)}`;
      throw e;
    }
    return response.json();
  });
  return data;
}
