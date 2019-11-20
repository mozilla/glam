/* eslint-disable import/prefer-default-export */

const url = '__BASE_DOMAIN__/api/v1/data/';

export async function getProbeData(params) {
  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: params }),
  }).then((response) => response.json());
  return data;
}
