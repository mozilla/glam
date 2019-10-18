import { readable } from 'svelte/store';
import FlexSearch from 'flexsearch';
// FIXME: this dependency cycle is innocuous but we should fix it.
import { store, updateProbe } from './store'; // eslint-disable-line

// TODO: Make this dynamic based on prod vs local dev.
const url = 'http://localhost:8000/api/v1/probes';


const telemetrySearch = readable({ loaded: false }, async (set) => {
  const resp = await fetch(url).then((r) => r.json());
  const data = Object.keys(resp.probes).map((key, i) => (
    { id: i, ...resp.probes[key] }
  ));
  const search = new FlexSearch({
    suggest: true,
    // encode: 'advanced',
    // tokenize: 'full',
    // threshold: 1,
    // resolution: 3,
    doc: {
      id: 'id',
      field: ['name', 'apiName', 'description', 'type'],
    },
  });
  search.add(data);
  search.loaded = true;
  // look to see if we need to update the probe information in the store.
  // If so, here is where the update happens.
  const { probe } = store.getState();
  if (probe.apiName) {
    const probeInfo = data.find((d) => d.apiName === probe.apiName);
    if (probeInfo) {
      store.dispatch(updateProbe(probeInfo));
    }
  }
  set(search);
});

export default telemetrySearch;
