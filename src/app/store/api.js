
/* eslint-disable import/prefer-default-export */
export async function getProbeData(params) {
  const URL = 'http://localhost:8000/api/v1/data';
  const data = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: params }),
  }).then((response) => response.json());
  return data;
}

export async function getFirefoxVersionDates() {
  const URL = 'https://product-details.mozilla.org/1.0/firefox.json';
  const { releases } = await fetch(URL).then((r) => r.json());
  const out = { nightly: {}, beta: {}, release: {} };
  Object.keys(releases)
    .filter((r) => (releases[r].category === 'major' && +releases[r].version > 50) && !r.includes('esr'))
    .forEach((r) => {
      const release = releases[r];
      const v = +releases[r].version;
      out.release[v] = {};
      if (!((v - 1) in out.release)) out.release[v - 1] = {};
      out.beta[v + 1] = {};
      if (!(v in out.beta)) out.beta[v] = {};
      out.nightly[v + 2] = {};
      if (!((v + 1) in out.nightly)) out.nightly[v + 1] = {};

      out.release[v].start = release.date;
      out.beta[v + 1].start = release.date;
      out.nightly[v + 2].start = release.date;

      out.release[v - 1].end = release.date;
      out.beta[v].end = release.date;
      out.nightly[v + 1].end = release.date;
    });
  const versionAPI = { data: out };
  versionAPI.get = (channel, version) => versionAPI.data[channel][version];
  versionAPI.listReleases = (channel) => Object
    .entries(versionAPI.data[channel])
    .map(([version, { start, end }]) => ({ version, start, end }));
  return versionAPI;
}
