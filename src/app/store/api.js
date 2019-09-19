const URL = 'http://localhost:8000/api/v1/data';

/* eslint-disable import/prefer-default-export */
export async function getProbeData(params) {
  const data = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: params }),
  }).then((response) => response.json());
  return data;
}
