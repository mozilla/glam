import { derived, get } from 'svelte/store';

import { createStore } from '../utils/create-store';

// FIXME: take care of this dependency cycle.
import { probeSet } from './telemetry-search'; // eslint-disable-line import/no-cycle

import sharedConfig from '../config/shared';
import productConfig from '../config/products';

export function getFromQueryString(fieldKey, isMulti = false) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(fieldKey);
  if (isMulti) {
    return JSON.parse(value);
  }
  return value;
}

function getDefaultState(
  { basedOnQueryParams } = { basedOnQueryParams: false }
) {
  const state = {};

  state.auth = {
    isAuthenticated: false,
    token: undefined,
  };

  // FIXME: applicationStatus or dashboardMode, not both.
  state.applicationStatus = 'INITIALIZING';
  state.dashboardMode = {};

  // Grab a valid product from the URL or default to "firefox". Among other
  // things, this enables the use of Storybook. (We have little control over
  // Storybook's URL.)
  const firstPathComponent = window.location.pathname.split('/')[1];

  if (Object.keys(productConfig).includes(firstPathComponent)) {
    state.product = firstPathComponent;
  } else {
    state.product = 'firefox';
  }

  state.probeName = '';
  state.recordedInProcesses = []; // Provided by the API. List of processes this probe was recording in.
  state.reference = getFromQueryString('reference') || '';
  state.route = {};

  // Shared config
  Object.entries(sharedConfig).forEach(([key, { isMulti, defaultValue }]) => {
    if (basedOnQueryParams) {
      state[key] = getFromQueryString(key, isMulti) || defaultValue;
    } else {
      state[key] = defaultValue;
    }
  });

  // Product config
  state.productDimensions = {};
  Object.entries(productConfig[state.product].dimensions).forEach(
    ([key, { defaultValue }]) => {
      if (basedOnQueryParams) {
        state.productDimensions[key] = getFromQueryString(key) || defaultValue;
      } else {
        state.productDimensions[key] = defaultValue;
      }
    }
  );

  return state;
}

export const store = createStore(getDefaultState({ basedOnQueryParams: true }));

store.reset = () => {
  store.reinitialize({
    auth: store.getState().auth,
    probeName: '',
  });
};

export function getActiveProductConfig() {
  return productConfig[get(store).product];
}

export function getField(fieldKey) {
  const activeProductConfig = getActiveProductConfig();
  return activeProductConfig.dimensions[fieldKey];
}

export function getFieldValues(fieldKey) {
  return getField(fieldKey).values;
}

export function isField(fieldKey) {
  const activeProductConfig = getActiveProductConfig();
  return Object.keys(activeProductConfig.dimensions).includes(fieldKey);
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

export function getFromQueryStringOrDefault(fieldKey, isMulti = false) {
  const value = getFromQueryString(fieldKey, isMulti);
  if (!value) {
    return getDefaultFieldValue(fieldKey);
  }
  return value;
}

export const resetFilters = () => {
  //
  const config = getActiveProductConfig();
  Object.entries(config.dimensions).forEach(([key, { defaultValue }]) => {
    store.setDimension(key, defaultValue);
  });

  // store.setDimension('channel', getDefaultFieldValue('channel'));
  // store.setDimension('os', getDefaultFieldValue('os'));
  // store.setDimension(
  //   'aggregationLevel',
  //   getDefaultFieldValue('aggregationLevel')
  // );
  // store.setDimension('process', getDefaultFieldValue('process'));
};

export const probe = derived([probeSet, store], ([$probeSet, $store]) => {
  if (!$probeSet || !$store.probeName) return undefined;
  const activeProductConfig = getActiveProductConfig();
  let pr = $probeSet.find((p) => p.name === $store.probeName);
  if (activeProductConfig.transformProbeForGLAM)
    pr = activeProductConfig.transformProbeForGLAM(pr);
  return pr;
});

export const hasDefaultControlFields = derived(store, ($store) => {
  const activeProductConfig = getActiveProductConfig();
  return Object.values(activeProductConfig.dimensions).every(
    (field) =>
      !field.values ||
      field.skipValidation === true ||
      field.values[0].key === $store[field.key]
  );
});

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

    const activeProductConfig = getActiveProductConfig();
    const params = activeProductConfig.getParamsForDataAPI($store);
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
      cache[qs] = activeProductConfig.fetchData(params, store);
    }

    // compare the previousQuery to the current one.
    // if the actual query params have changed, let's update the
    // data set.
    if (previousQuery !== qs) {
      previousQuery = qs;
      set(
        cache[qs].then(({ data }) =>
          activeProductConfig.updateStoreAfterDataIsReceived(data, store, probe)
        )
      );
    }
  }
);

export const currentQuery = derived(store, ($store) => {
  const activeProductConfig = getActiveProductConfig();
  const params = activeProductConfig.getParamsForQueryString($store);
  return toQueryString(params);
});
