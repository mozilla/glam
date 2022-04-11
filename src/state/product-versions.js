import { readable, derived } from 'svelte/store';

export const productDetails = readable(undefined, async (set) => {
  const request = await fetch(
    'https://product-details.mozilla.org/1.0/all.json'
  );
  const data = await request.json();
  set(data.releases);
  return () => undefined;
});

export const firefoxReleases = derived(productDetails, ($pd) => {
  if ($pd === undefined) return undefined;

  const releases = Object.entries($pd)
    .filter(
      ([key, { category }]) => category === 'major' && key.includes('firefox')
    )
    .sort(
      (
        [_a, { date: ad }], // eslint-disable-line no-unused-vars
        [_b, { date: bd }] // eslint-disable-line no-unused-vars
      ) => {
        if (ad > bd) return 1;
        if (ad < bd) return -1;
        return 0;
      }
    )
    .map(
      (
        [_, i] // eslint-disable-line no-unused-vars
      ) => {
        const info = { ...i };
        info.str = info.date;
        info.date = new Date(info.date);
        let version = parseInt(info.version, 10);
        if (version >= 4) version = ~~version; // eslint-disable-line no-bitwise
        info.label = version;
        return info;
      }
    )
    .filter((info) => info.str > '2016-06-01');

  return releases;
});

export const firefoxVersionMarkers = derived(firefoxReleases, ($releases) =>
  $releases ? $releases.map((r) => ({ label: r.label, date: r.date })) : []
);

export const fenixVersionMarkers = derived(firefoxReleases, ($releases) =>
  $releases ? $releases.map((r) => ({ label: r.label, date: r.date })) : []
);
