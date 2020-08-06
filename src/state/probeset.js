import { readable } from 'svelte/store';

// TODO: Make this dynamic based on prod vs local dev.
const url = '__BASE_DOMAIN__/api/v1/probes/';

const probeSet = readable(undefined, async (set) => {
  const resp = await fetch(url).then((r) => r.json());
  const data = Object.keys(resp.probes).map((key, i) => ({
    id: i,
    ...resp.probes[key],
  }));
  set(data);
});

export default probeSet;
