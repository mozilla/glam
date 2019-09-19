import { writable, derived, get } from 'svelte/store';
import produce from 'immer';
import telemetrySearch from './telemetry-search';
import { getProbeData } from './api';

import CONFIG from '../config.json';

import { weightedQuantile } from '../../utils/stats';

export function getFieldValues(fieldKey) {
  return CONFIG.fields[fieldKey].values;
}

export function isField(fieldKey) {
  return Object.keys(CONFIG.fields).includes(fieldKey);
}

export function getFieldValueMetadata(fieldKey, valueKey) {
  return getFieldValues(fieldKey).find((v) => v.key === valueKey);
}

export function isValidFieldValue(fieldKey, valueKey) {
  return getFieldValues(fieldKey).map((fv) => fv.key).includes(valueKey);
}

export function getFieldValueLabel(fieldKey, valueKey) {
  return getFieldValueMetadata(fieldKey, valueKey).label;
}

export function getDefaultFieldValue(fieldKey) {
  return getFieldValues(fieldKey)[0].key;
}

// TODO: get latest version for whatever the default channel is.
const initStore = {
  probe: {
    name: undefined,
    apiName: undefined,
    description: undefined,
    audienceSize: 0,
    totalSize: 0,
  },
  product: 'Firefox',
  channel: getDefaultFieldValue('channel'),
  os: getDefaultFieldValue('os'),
  versions: [70, 69, 68],
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

export const updateField = (field, value) => (draft) => { draft[field] = value; };

export const updateProbe = (probe) => updateField('probe', probe);
export const updateProduct = (product) => updateField('product', product);
export const updateChannel = (channel) => updateField('channel', channel);
export const updateOS = (os) => updateField('os', os);

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

// further derivations from the store

export const hasDefaultControlFields = derived(store, ($store) => Object.values(CONFIG.fields)
  .every((field) => field.values[0].key === $store[field.key]));

// ///// probe querying infrastructure.

function getParamsForDataAPI(obj) {
  return {
    versions: obj.versions,
    channel: obj.channel,
    probe: obj.probe.apiName,
    os: obj.os,
  };
}

function toQueryString(params) {
  const keys = Object.keys(params);
  keys.sort();
  return keys.map((k) => `${k}=${params[k]}`).join('&');
}

function paramsAreValid(params) {
  return Object.entries(params)
    .filter(([k]) => isField(k))
    .every(([fieldKey, valueKey]) => isValidFieldValue(fieldKey, valueKey));
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
    cache[qs] = getProbeData(params);
  }

  return cache[qs];
});
