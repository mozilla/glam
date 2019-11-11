import { writable, derived, get } from 'svelte/store';
import produce from 'immer';
// FIXME: take care of this dependency cycle.
import telemetrySearch from './telemetry-search'; // eslint-disable-line
import {
  setAggregationLevel, setOS, setChannel, setApplicationStatus, setDashboardMode,
} from './actions';
import { getProbeData } from './api';
import { createCatColorMap } from '../../components/data-graphics/utils/color-maps';


import CONFIG from '../config.json';


import { byKeyAndAggregation } from '../utils/probe-utils';

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
  // const isMulti = getField(fieldKey).type === 'multi';
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

// TODO: get latest version for whatever the default channel is.
const initStore = {
  probe: {
    name: getFromQueryString('probe'),
    apiName: getFromQueryString('probe'),
    description: undefined,
    audienceSize: 0,
    totalSize: 0,
    versions: [],
  },
  dashboardMode: { },
  aggregationLevel: getFromQueryStringOrDefault('aggregationLevel'),
  product: 'Firefox',
  channel: getFromQueryStringOrDefault('channel'),
  os: getFromQueryStringOrDefault('os'),
  versions: getFromQueryString('versions', true) || [70, 69],
  searchIsActive: false,
  searchQuery: '',
  timeHorizon: getFromQueryString('timeHorizon') || 'MONTH',
  visiblePercentiles: getFromQueryString('visiblePercentiles', true) || [95, 75, 50, 25, 5],
  proportionMetricType: getFromQueryString('proportionMetricType') || 'proportions', //
  activeBuckets: getFromQueryString('activeBuckets', true) || [],
  applicationStatus: 'INITIALIZING', // FIXME: applicationStatus or dashboardMode, not both?
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

export const getState = () => get(STORE);

export const store = {
  subscribe: STORE.subscribe, dispatch, connect, getState,
};


export const resetFilters = () => async () => {
  dispatch(setChannel(getDefaultFieldValue('channel')));
  dispatch(setOS(getDefaultFieldValue('os')));
  dispatch(setAggregationLevel(getDefaultFieldValue('aggregationLevel')));
};


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
    probe: obj.probe.apiName,
    os: obj.os,
    aggregationLevel: obj.aggregationLevel,
    timeHorizon: obj.timeHorizon,
    proportionMetricType: obj.proportionMetricType,
    activeBuckets: obj.activeBuckets,
  };
}

function getParamsForDataAPI(obj) {
  const channelValue = getFieldValueKey('channel', obj.channel);
  const osValue = getFieldValueKey('os', obj.os);
  const params = getParamsForQueryString(obj);
  delete params.timeHorizon;
  delete params.proportionMetricType;
  delete params.activeBuckets;
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

const cache = {};

export const datasetResponse = (level, key, data) => ({ level, key, data });

function isCategoricalData(probe) {
  return ((probe.type === 'histogram' && probe.kind === 'enumerated')
  || probe.kind === 'categorical' || probe.kind === 'flag' || probe.kind === 'boolean');
}

// FIXME: let's remove this function. It's almost comically redundant.
export function responseToData(data, probeClass = 'quantile', probeType, aggregationMethod = 'build_id') {
  return byKeyAndAggregation(data, probeClass, aggregationMethod, { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });
}


const makeSortOrder = (latest) => (a, b) => {
  // get latest data point and see
  if (latest.counts[a] < latest.counts[b]) return 1;
  if (latest.counts[a] >= latest.counts[b]) return -1;
  return 0;
};


function sampleDatapoint(tr) {
  return Object.values(Object.values(tr)[0])[0][0];
}

function latestDatapoint(tr) {
  const series = Object.values(Object.values(tr)[0])[0];
  // FIXME: this should be the last value, not the second to last
  return series[series.length - 2];
}

function getBucketKeys(tr) {
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


export function fetchDataForGLAM(params) {
  // const { probe } = currentStore;
  return getProbeData(params).then(
    (payload) => {
      const { probe } = get(store);
      const isCategorical = isCategoricalData(probe);
      return responseToData(payload.response, isCategorical ? 'proportion' : 'quantile', `${probe.type}-${probe.kind}`);
    },
  );
}

export const dataset = derived(store, ($store) => {
  const params = getParamsForDataAPI($store);
  const qs = toQueryString(params);

  if (!paramsAreValid(params) && probeSelected($store.probe.name)) {
    const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
    dispatch(setDashboardMode(message));
    return datasetResponse(message);
  }

  if (!probeSelected($store.probe.name)) {
    const message = datasetResponse('INFO', 'DEFAULT_VIEW');
    if ($store.dashboardMode.key !== 'DEFAULT_VIEW') {
      dispatch(setDashboardMode(message));
      dispatch(setApplicationStatus('ACTIVE'));
    }
    return message;
  }
  if (!(qs in cache)) {
    cache[qs] = fetchDataForGLAM(params, $store);
  }

  return {
    level: 'SUCCESS', key: 'EXPLORER_VIEW', data: cache[qs], probeType: `${$store.probe.type}-${$store.probe.kind}`,
  };
});

export const currentQuery = derived(store, ($store) => {
  const params = getParamsForQueryString($store);
  return toQueryString(params);
});
