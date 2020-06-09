import { derived, get } from 'svelte/store';

import { createCatColorMap } from 'udgl/data-graphics/utils/color-maps';
import { createStore } from '../utils/create-store';

// FIXME: take care of this dependency cycle.
import telemetrySearch, { probeSet } from './telemetry-search'; // eslint-disable-line import/no-cycle

import { getProbeData } from './api';

import CONFIG from '../config/firefox-desktop';
import { numHighlightedBuckets } from '../config/shared';

import {
  transformGLAMAPIResponse,
  getProbeViewType,
  isCategorical,
} from '../utils/probe-utils';

import { validate, noResponse } from '../utils/data-validation';

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

function getParamsForQueryString(obj) {
  // FIXME: turn this conditional into a function in firefox-desktop.js
  if (obj.product === 'firefoxDesktop') {
    return {
      channel: obj.productDimensions.channel,
      os: obj.productDimensions.os,
      aggregationLevel: obj.productDimensions.aggregationLevel,
      process: obj.productDimensions.process,
      timeHorizon: obj.timeHorizon,
      proportionMetricType: obj.proportionMetricType,
      activeBuckets: obj.activeBuckets,
      visiblePercentiles: obj.visiblePercentiles,
    };
  }
  throw Error('Product not recognized.');
}

function getParamsForDataAPI(obj) {
  // FIXME: turn this conditional into a function in firefox-desktop.js
  if (obj.product === 'firefoxDesktop') {
    const channelValue = obj.productDimensions.channel;
    const osValue = obj.productDimensions.os;
    const { process } = obj.productDimensions;
    const params = getParamsForQueryString(obj);
    delete params.timeHorizon;
    delete params.proportionMetricType;
    delete params.activeBuckets;
    delete params.visiblePercentiles;
    params.probe = obj.probeName;
    params.os = osValue;
    params.channel = channelValue;
    params.process = process;
    return params;
  }
  throw Error('product not recognized.');
}

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

const makeSortOrder = (latest, which = 'counts') => (a, b) => {
  // get latest data point and see
  if (latest[which][a] < latest[which][b]) return 1;
  if (latest[which][a] >= latest[which][b]) return -1;
  return 0;
};

function latestDatapoint(tr) {
  return tr[tr.length - 1];
}

export function getBucketKeys(tr) {
  return Object.keys(latestDatapoint(tr).counts);
}

export function extractBucketMetadata(transformedData) {
  const etc = {};
  const options = getBucketKeys(transformedData);
  const cmpBuckets = getBucketKeys(transformedData);
  const sorter = makeSortOrder(latestDatapoint(transformedData));
  cmpBuckets.sort(sorter);
  const cmp = createCatColorMap(cmpBuckets);
  const initialBuckets = cmpBuckets.slice(0, numHighlightedBuckets);
  etc.bucketOptions = options;
  etc.bucketColorMap = cmp;
  etc.initialBuckets = initialBuckets;
  etc.bucketSortOrder = sorter;
  return etc;
}

export function fetchDataForGLAM(params) {
  return getProbeData(params, store.getState().auth.token).then((payload) => {
    // FIXME: this should not be reading from the store.
    // the response is kind of messed up so once the API / data is fixed
    // the response shluld consume from payload.response[0].metric_type.
    // until then, however, we'll have to use the store values
    // for the probeType and probeKind, since they're more accurate than
    // what is in payload.response[0].metric_type.
    const { aggregationLevel } = store.getState().productDimensions;
    const { type: probeType, kind: probeKind, active: probeActive } = get(
      probe
    );

    validate(payload, (p) => noResponse(p, probeActive));
    const data = transformGLAMAPIResponse(
      payload.response,
      isCategorical(probeType, probeKind) ? 'proportion' : 'quantile',
      aggregationLevel,
      {
        probeType: `${probeType}-${probeKind}`,
      }
    );

    return {
      data,
      probeType,
      probeKind,
    };
  });
}

export function updateStoreAfterDataIsReceived({ data }) {
  const probeValue = get(probe);
  // THIS WILL BE FALSE BECAUSE WE HAVE NOT RECEIVED THE PROBE DATA YET.
  const viewType = getProbeViewType(probeValue.type, probeValue.kind);
  const isCategoricalTypeProbe = viewType === 'categorical';
  let etc = {};
  if (isCategoricalTypeProbe) {
    etc = extractBucketMetadata(data);
  }

  if (isCategoricalTypeProbe) {
    store.setField('activeBuckets', etc.initialBuckets);
  }
  store.setField('recordedInProcesses', probeValue.record_in_processes);
  return { data, viewType, ...etc };
}

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

    const params = getParamsForDataAPI($store);
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
      cache[qs] = fetchDataForGLAM(params);
    }

    // compare the previousQuery to the current one.
    // if the actual query params have changed, let's update the
    // data set.
    if (previousQuery !== qs) {
      previousQuery = qs;
      set(cache[qs].then(updateStoreAfterDataIsReceived));
    }
  }
);

export const currentQuery = derived(store, ($store) => {
  const params = getParamsForQueryString($store);
  return toQueryString(params);
});
