import { writable, derived, get } from 'svelte/store';
import produce from 'immer';
import telemetrySearch from './telemetry-search';
import { getProbe } from './api';

import { weightedQuantile } from '../../utils/stats';

const initStore = {
  probe: {
    name: undefined,
    description: undefined,
    audienceSize: 0,
    totalSize: 0,
  },
  product: 'Firefox',
  channel: 'nightly',
  os: 'Windows',
  version: 70,
  searchIsActive: false,
  result: Promise.resolve(undefined),
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
    let resultSet = [];
    if ($telemetrySearch.loaded) {
      resultSet = $telemetrySearch.search($query).map((r, searchID) => ({ ...r, searchID }));
    }

    return { results: resultSet, total: $telemetrySearch.length };
  },
);

// ///// probe querying infrastructure.


// hook into store here.

function getParamsForDataAPI(obj) {
  return {
    version: `${obj.version}`, probe: obj.probe.name ? obj.probe.name.toLowerCase() : undefined, channel: obj.channel, os: obj.os,
  };
}

function toQueryString(params) {
  const keys = Object.keys(params);
  keys.sort();
  return keys.map((k) => `${k}=${params[k]}`).join('&');
}


function fetchData(params) {
  // return new Promise((r) => setTimeout(() => r(qs), 3000));
  return getProbe(params);
}

// V1: subscribe to the store. If a query param changes,
// "run the query" by dispatching a change to draft.result
// which also caches the result value. This implementation is incomplete.
// We still need a way of updating the query params and retrieving the cache,
// which this does not do. Perhaps another store or something else can
// accomplish this.
// STORE.subscribe((state) => {
//   const params = getParamsForDataAPI(state);
//   const qs = toQueryString(params);
//   if (!(qs in cache)) {
//     cache[qs] = fetchData(qs);
//     store.dispatch((draft) => {
//       draft.result = cache[qs];
//     });
//   }
// });

// V2: don't make this another subscription that responds to
// store changes. Instead, when a query param updates in the atomic action,
// also update draft.result w/ either the cached promise or otherwise.

/* eslint-disable no-param-reassign */
// function returnCacheOrNewQuery(draftState) {
//   const params = getParamsForDataAPI(draftState);
//   const queryString = toQueryString(params);
//   if (!((queryString) in cache)) {
//     cache[queryString] = fetchData(queryString);
//   }
//   draftState.result = cache[queryString];
// }

// V3: create a derived store that reads from the cache, and simply leave it at
// that.

function paramsAreValid(params) {
  return params.os !== 'all' && params.version !== undefined && params.probe !== undefined;
}

const cache = {};

function toWeightedQuantiles(probe, q = [0.05, 0.25, 0.5, 0.75, 0.95]) {
  const values = Object.keys(probe.histogram).map((v) => +v);
  const weights = Object.values(probe.histogram);
  return weightedQuantile(q, values, weights);
}

export const dataset = derived(store, ($store) => {
  const params = getParamsForDataAPI($store);
  const qs = toQueryString(params);
  if (!paramsAreValid(params)) {
    return Promise.reject(new Error('parameters not valid'));
  }
  if (!(qs in cache)) {
    cache[qs] = fetchData(params);
  }
  return cache[qs].then(toWeightedQuantiles);
});
