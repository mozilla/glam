import { derived } from 'svelte/store';

import { createStore } from '../utils/create-store';

// FIXME: take care of this dependency cycle.
import { probeSet } from './telemetry-search'; // eslint-disable-line import/no-cycle

import CONFIG from '../config/firefox-desktop';

// TODO: move this to the new config.js when 'product' is added.
const DEFAULT_PROBE_PROCESS = 'content';

export function getField(fieldKey) {
  return CONFIG.dimensions[fieldKey];
}

export function getFieldValues(fieldKey) {
  return getField(fieldKey).values;
}

export function isField(fieldKey) {
  return Object.keys(CONFIG.dimensions).includes(fieldKey);
}

export function getFieldValueMetadata(fieldKey, valueKey) {
  return getFieldValues(fieldKey).find((v) => v.key === valueKey);
}

export function isValidFieldValue(fieldKey, valueKey) {
  const field = getField(fieldKey);
  if (field.skipValidation) return true;
  return getFieldValues(fieldKey)
    .map((fv) => fv.key)
    .includes(valueKey);
}

export function getFieldValueLabel(fieldKey, valueKey) {
  const metadata = getFieldValueMetadata(fieldKey, valueKey);
  return metadata ? metadata.label : undefined;
}

export function getDefaultFieldValue(fieldKey) {
  return getFieldValues(fieldKey)[0].key;
}

export function getFromQueryString(fieldKey, isMulti = false) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(fieldKey);
  if (isMulti) {
    return JSON.parse(value);
  }
  return value;
}

export function getFromQueryStringOrDefault(fieldKey, isMulti = false) {
  const value = getFromQueryString(fieldKey, isMulti);
  if (!value) {
    return getDefaultFieldValue(fieldKey);
  }
  return value;
}

const initialState = {
  auth: {
    isAuthenticated: false,
    token: undefined,
  },
  product: 'firefoxDesktop', // FIXME: derive this elsewhere like QS
  productDimensions: {
    channel: getFromQueryStringOrDefault('channel'),
    os: getFromQueryString('os') || 'Windows',
    process: getFromQueryString('process') || DEFAULT_PROBE_PROCESS, // This refers to the UI selected process.
    aggregationLevel: getFromQueryStringOrDefault('aggregationLevel'),
  },
  probeName: '',
  dashboardMode: {}, // FIXME: applicationStatus or dashboardMode, not both.
  recordedInProcesses: [], // Provided by the API. List of processes this probe was recording in.
  timeHorizon: getFromQueryString('timeHorizon') || 'MONTH',
  visiblePercentiles: getFromQueryString('visiblePercentiles', true) || [
    95,
    75,
    50,
    25,
    5,
  ],
  proportionMetricType:
    getFromQueryString('proportionMetricType') || 'proportions', //
  activeBuckets: getFromQueryString('activeBuckets', true) || [],
  applicationStatus: 'INITIALIZING', // FIXME: applicationStatus or dashboardMode, not both.
  route: {},
  reference: getFromQueryString('reference') || '',
};

export const store = createStore(initialState);

store.reset = () => {
  store.reinitialize({
    auth: store.getState().auth,
    probeName: '',
  });
};

export const resetFilters = () => {
  store.setDimension('channel', getDefaultFieldValue('channel'));
  store.setDimension('os', getDefaultFieldValue('os'));
  store.setDimension(
    'aggregationLevel',
    getDefaultFieldValue('aggregationLevel')
  );
  store.setDimension('process', getDefaultFieldValue('process'));
};

export const probe = derived([probeSet, store], ([$probeSet, $store]) => {
  if (!$probeSet || !$store.probeName) return undefined;
  let pr = $probeSet.find((p) => p.name === $store.probeName);
  if (CONFIG.transformProbeForGLAM) pr = CONFIG.transformProbeForGLAM(pr);
  return pr;
});

export const hasDefaultControlFields = derived(store, ($store) =>
  Object.values(CONFIG.dimensions).every(
    (field) =>
      !field.values ||
      field.skipValidation === true ||
      field.values[0].key === $store[field.key]
  )
);

// ///// probe querying infrastructure.

const toQueryStringPair = (k, v) => {
  if (Array.isArray(v)) {
    return `${k}=${encodeURIComponent(JSON.stringify(v))}`;
  }
  return `${k}=${encodeURIComponent(v)}`;
};

function toQueryString(params) {
  const keys = Object.keys(params);
  keys.sort();
  return keys.map((k) => toQueryStringPair(k, params[k])).join('&');
}

function probeSelected(probeValue) {
  return (
    probeValue !== undefined && probeValue !== 'null' && probeValue !== null
  );
}

function paramsAreValid(params) {
  return (
    Object.entries(params)
      .filter(([k]) => isField(k))
      .every(([fieldKey, valueKey]) => isValidFieldValue(fieldKey, valueKey)) &&
    probeSelected(params.probe)
  );
}

export const datasetResponse = (level, key, data) => ({ level, key, data });

const cache = {};
let previousQuery;

export const dataset = derived(
  [store, probeSet],
  ([$store, $probeSet], set) => {
    // FIXME: we have to check for whether probeSet is loaded before
    // moving on. This is because the data fetch does _not_ return
    // the proper information about probe types & kinds (specifically,
    // enumerated histograms are coded as linear in the demo data set).
    // This should be checked again once we have verified that the bug
    // in the demo data is fixed.
    if (!$probeSet) return;

    // We can't fetch anything until the user is authenticated
    if (!$store.auth.isAuthenticated) return;

    const params = CONFIG.getParamsForDataAPI($store);
    const qs = toQueryString(params);

    // // invalid parameters, probe selected.
    if (!paramsAreValid(params) && probeSelected($store.probeName)) {
      const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
      return message;
    }

    // // no probe selected.
    if (!probeSelected($store.probeName)) {
      const message = datasetResponse('INFO', 'DEFAULT_VIEW');
      return message;
    }

    if (!(qs in cache)) {
      cache[qs] = CONFIG.fetchData(params, store);
    }

    // compare the previousQuery to the current one.
    // if the actual query params have changed, let's update the
    // data set.
    if (previousQuery !== qs) {
      previousQuery = qs;
      set(
        cache[qs].then(({ data }) =>
          CONFIG.updateStoreAfterDataIsReceived(data, store, probe)
        )
      );
    }
  }
);

export const currentQuery = derived(store, ($store) => {
  const params = CONFIG.getParamsForQueryString($store);
  return toQueryString(params);
});
