import { writable, derived, get } from 'svelte/store';
import produce from 'immer';
import telemetrySearch from './telemetry-search';

const initStore = {
  probe: {
    name: undefined,
    description: undefined,
    audienceSize: 0,
    totalSize: 0,
  },
  product: 'all',
  channel: 'all',
  os: 'all',
  searchIsActive: false,
};

const STORE = writable(initStore);

// this works very similar to what you'd expect in a redux setting.
// eg. dispatch(changeChannel('beta')) should take the changeChannel
// action, which returns a draft-mutating function to be fed into
// immer's produce function.
export const dispatch = (func) => {
  // I thought about using func.length (if it has two args, then we are go)
  // but you may only have one. For now, I think marking a function a async
  // works.
  if (func.constructor.name === 'AsyncFunction') {
    // composite update (thunk). Async may or may not be
    // necessary here, but might as well make all of these async by
    // default.
    func(dispatch, () => get(STORE));
  } else {
    // atomic update (singular state change).
    STORE.update((state) => produce(state, func));
  }
};

export const connect = (func) => (...args) => dispatch(func(...args));

export const store = { subscribe: STORE.subscribe, dispatch, connect };

export const notDefaultSettings = derived(store, ($store) => {
  const validFields = ['product', 'channel', 'os'];
  return !validFields.every((f) => $store[f] === 'all');
});

// const getNextId = (arr) => {
//     if (!arr.length) return 0;
//     return Math.max(...arr.map(it => it.id), 0) + 1;
// }


export const updateProbe = (probe) => (draft) => { draft.probe = probe; };
export const updateProduct = (product) => (draft) => { draft.product = product; };
export const updateChannel = (channel) => (draft) => { draft.channel = channel; };
export const updateOS = (os) => (draft) => { draft.os = os; };

// search
export const updateSearchIsActive = (tf) => (draft) => { draft.searchIsActive = tf; };
export const searchQuery = writable('');
export const updateSearchQuery = (s) => { searchQuery.set(s); };

export const resetFilters = () => async () => {
  dispatch(updateProduct('all'));
  dispatch(updateChannel('all'));
  dispatch(updateOS('all'));
};

export const searchResults = derived(
  [telemetrySearch, searchQuery], ([$telemetrySearch, $query]) => {
    let candidates;
    let resultSet = [];
    if ($telemetrySearch.loaded) {
      // , {limit:30}
      candidates = $telemetrySearch.search($query).map((r, searchID) => ({ ...r, searchID }));
      // const candidateIDs = candidates.map(c=>c.id);

      // if same length and same names, then
      // do not update resultSet.
      // const sameLength = resultSet.length === candidates.length;
      // const sameNames = candidates.every((c,i) => {
      //     return resultSet[i] && resultSet[i].id && resultSet[i].id === c.id;
      // })

      // if (!sameLength || !sameNames) {
      //     resultSet = candidates;
      //     hovered = resultSet[0].searchID;
      // }
      resultSet = candidates;
    }

    return { results: resultSet, total: $telemetrySearch.length };
  },
);
