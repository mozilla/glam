import { derived, get } from 'svelte/store';

import { createCatColorMap } from 'udgl/data-graphics/utils/color-maps';
import { createStore } from '../utils/create-store';

// FIXME: take care of this dependency cycle.
import telemetrySearch, { probeSet } from './telemetry-search'; // eslint-disable-line import/no-cycle

import { getProbeData } from './api';

import CONFIG from '../config.json';

import { byKeyAndAggregation, getProbeViewType } from '../utils/probe-utils';

import { validate, noDuplicates, noResponse } from '../utils/data-validation';

// TODO: move this to the new config.js when 'product' is added.
const DEFAULT_PROBE_PROCESS = 'content';

export function getField(fieldKey) {
  return CONFIG.fields[fieldKey];
}

export function getFieldValues(fieldKey) {
  return getField(fieldKey).values;
}

export function isField(fieldKey) {
  return Object.keys(CONFIG.fields).includes(fieldKey);
}

export function getFieldValueMetadata(fieldKey, valueKey) {
  return getFieldValues(fieldKey).find((v) => v.key === valueKey);
}

export function getFieldValueKey(fieldKey, valueKey) {
  const metadata = getFieldValueMetadata(fieldKey, valueKey);
  if (metadata && metadata.keyTransform) {
    if (metadata.keyTransform === 'NULL') { return null; }
  }
  return valueKey;
}

export function isValidFieldValue(fieldKey, valueKey) {
  const field = getField(fieldKey);
  if (field.skipValidation) return true;
  return getFieldValues(fieldKey).map((fv) => {
    // apply any key transforms that might need to happen.
    if (fv.keyTransform) {
      if (fv.keyTransform === 'NULL') return null;
    }
    return fv.key;
  }).includes(valueKey);
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
  probeName: '',
  dashboardMode: { }, // FIXME: applicationStatus or dashboardMode, not both.
  aggregationLevel: getFromQueryStringOrDefault('aggregationLevel'),
  channel: getFromQueryStringOrDefault('channel'),
  os: getFromQueryString('os') || 'Windows',
  versions: getFromQueryString('versions', true) || [],
  process: getFromQueryString('process') || DEFAULT_PROBE_PROCESS,
  searchIsActive: false,
  searchQuery: '',
  timeHorizon: getFromQueryString('timeHorizon') || 'MONTH',
  visiblePercentiles: getFromQueryString('visiblePercentiles', true) || [95, 75, 50, 25, 5],
  proportionMetricType: getFromQueryString('proportionMetricType') || 'proportions', //
  activeBuckets: getFromQueryString('activeBuckets', true) || [],
  applicationStatus: 'INITIALIZING', // FIXME: applicationStatus or dashboardMode, not both.
  route: {},
};

export const store = createStore(initialState);

store.reset = () => {
  store.reinitialize({
    auth: store.getState().auth,
    probeName: undefined,
  });
};

export const resetFilters = () => {
  store.setField('channel', getDefaultFieldValue('channel'));
  store.setField('os', getDefaultFieldValue('os'));
  store.setField('aggregationLevel', getDefaultFieldValue('aggregationLevel'));
  store.setField('process', getDefaultFieldValue('process'));
};

export const probe = derived([probeSet, store], ([$probeSet, $store]) => {
  if (!$probeSet || !$store.probeName) return undefined;
  return $probeSet.find((p) => p.name === $store.probeName);
});

export const searchResults = derived(
  [telemetrySearch, store], ([$telemetrySearch, $store]) => {
    const $query = $store.searchQuery;
    let resultSet = [];
    if ($telemetrySearch.loaded) {
      resultSet = $telemetrySearch.search($query).map((r, searchID) => ({ ...r, searchID }));
    }
    return { results: resultSet, total: $telemetrySearch.length };
  },
);

export const hasDefaultControlFields = derived(store, ($store) => Object.values(CONFIG.fields)
  .every((field) => (!field.values || (field.skipValidation === true))
    || field.values[0].key === $store[field.key]));

// ///// probe querying infrastructure.

function getParamsForQueryString(obj) {
  return {
    versions: obj.versions,
    channel: obj.channel,
    os: obj.os,
    aggregationLevel: obj.aggregationLevel,
    process: obj.process,
    timeHorizon: obj.timeHorizon,
    proportionMetricType: obj.proportionMetricType,
    activeBuckets: obj.activeBuckets,
    visiblePercentiles: obj.visiblePercentiles,
  };
}

function getParamsForDataAPI(obj) {
  const channelValue = getFieldValueKey('channel', obj.channel);
  const osValue = getFieldValueKey('os', obj.os);
  const params = getParamsForQueryString(obj);
  delete params.timeHorizon;
  delete params.proportionMetricType;
  delete params.activeBuckets;
  delete params.visiblePercentiles;
  params.probe = obj.probeName;
  params.os = osValue;
  params.channel = channelValue;
  return params;
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
  return probeValue !== undefined && probeValue !== 'null' && probeValue !== null;
}

function paramsAreValid(params) {
  return Object.entries(params)
    .filter(([k]) => isField(k))
    .every(([fieldKey, valueKey]) => isValidFieldValue(fieldKey, valueKey))
    && probeSelected(params.probe);
}


export const datasetResponse = (level, key, data) => ({ level, key, data });

// FIXME: let's remove this function. It's almost comically redundant.
export function responseToData(data, probeClass = 'quantile', probeType, aggregationMethod = 'build_id') {
  return byKeyAndAggregation(data, probeClass, aggregationMethod, { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });
}

const makeSortOrder = (latest, which = 'counts') => (a, b) => {
  // get latest data point and see
  if (latest[which][a] < latest[which][b]) return 1;
  if (latest[which][a] >= latest[which][b]) return -1;
  return 0;
};

function latestDatapoint(tr) {
  const series = Object.values(Object.values(tr)[0])[0];
  // FIXME: this should be the last value, not the second to last
  return series[series.length - 1];
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
  const initialBuckets = cmpBuckets.slice(0, 10);
  etc.bucketOptions = options;
  etc.bucketColorMap = cmp;
  etc.initialBuckets = initialBuckets;
  etc.bucketSortOrder = sorter;
  return etc;
}

export function isCategorical(probeType, probeKind) {
  return ((probeType === 'histogram' && probeKind === 'enumerated')
  || probeKind === 'categorical' || probeKind === 'flag' || probeKind === 'boolean');
}

export function fetchDataForGLAM(params) {
  return getProbeData(params, store.getState().auth.token).then(
    (payload) => {
      // FIXME: this should not be reading from the store.
      // the response is kind of messed up so once the API / data is fixed
      // the response shluld consume from payload.response[0].metric_type.
      // until then, however, we'll have to use the store values
      // for the probeType and probeKind, since they're more accurate than
      // what is in payload.response[0].metric_type.
      const { aggregationLevel } = store.getState();
      const { type: probeType, kind: probeKind, active: probeActive } = get(probe);

      validate(
        payload,
        (p) => noResponse(p, probeActive),
        (p) => noDuplicates(p, aggregationLevel),
      );

      return {
        data: responseToData(payload.response,
          isCategorical(probeType, probeKind) ? 'proportion' : 'quantile',
          `${probeType}-${probeKind}`, aggregationLevel),
        probeType,
        probeKind,
      };
    },
  );
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

  if (isCategoricalTypeProbe) store.setField('activeBuckets', etc.initialBuckets);
  return { data, viewType, ...etc };
}

const cache = {};
let previousQuery;

export const dataset = derived([store, probeSet], ([$store, $probeSet], set) => {
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
});

export const currentQuery = derived(store, ($store) => {
  const params = getParamsForQueryString($store);
  return toQueryString(params);
});
