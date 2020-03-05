/* eslint-disable import/prefer-default-export */

const dataURL = '__BASE_DOMAIN__/api/v1/data/';
const randomProbeURL = '__BASE_DOMAIN__/api/v1/probes/random/';

export async function getRandomProbes() {
  const data = await fetch(randomProbeURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ n: 9 }),
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
    // catch 500-level error responses and surface them into
    // the frontend.
    if (response.status >= 500 && response.status < 600) {
      const msg = 'Oh no! The server encountered an error.';
      const e = new Error(msg);
      const txt = await response.text();
      e.moreInformation = `The GLAM server had some trouble trying to fetch ${params.probe}, so we'll
      report the error here: 
      ${txt.split('\n').slice(0, 2)}`;
      throw e;
    }
    return response.json();
  });
  return data;
}
