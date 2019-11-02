import { readable, derived } from 'svelte/store';
import { store } from './store';


// not sure what to export here.

export const productDetails = readable(undefined, async (set) => {
  // if (!hasLoaded) {
  const request = await fetch('https://product-details.mozilla.org/1.0/all.json');
  const data = await request.json();
  set(data.releases);
  return () => undefined;
});


export const firefoxReleases = derived([store, productDetails], ([$store, $pd]) => {
  // get $usage for optionSet.
  // console.log($store.channel);
  const { channel } = $store;
  if ($pd === undefined) return undefined;
  return Object.entries($pd).filter(([key, { category }]) => category === 'major' && key.includes('firefox')).sort(([_a, { date: ad }], [_b, { date: bd }]) => {
    if (ad > bd) return 1;
    if (ad < bd) return -1;
    return 0;
  }).map(([_, info]) => {
    info.str = info.date;
    info.date = new Date(info.date);
    let version = parseInt(info.version);
    if (version >= 4) version = ~~version;
    if (channel === 'nightly') version += 2;
    if (channel === 'beta') version += 1;
    // version = `${version}`;
    info.label = version;
    return info;
  })
    .filter((info) => info.str > '2016-06-01');
});

export const firefoxVersionMarkers = derived(firefoxReleases, ($releases) => ($releases ? $releases.map((r) => ({ label: r.label, date: r.date })) : []));
