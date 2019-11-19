/* eslint-disable import/prefer-default-export */

const path = '__BASE_DOMAIN__';
const url = `${path}/api/v1/data/`;

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
