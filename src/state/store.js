import { derived, get } from 'svelte/store';

import { createStore } from '../utils/create-store';

// FIXME: take care of this dependency cycle.
import telemetrySearch, { probeSet } from './telemetry-search'; // eslint-disable-line

import { getProbeData } from './api';
import { createCatColorMap } from '../components/data-graphics/utils/color-maps';

import CONFIG from '../app/config.json';

import { byKeyAndAggregation, getProbeViewType } from '../utils/probe-utils';


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
const initialState = {
  probe: {
    name: getFromQueryString('probe'),
    description: undefined,
    audienceSize: 0,
    totalSize: 0,
    versions: [],
  },
  dashboardMode: { }, // FIXME: applicationStatus or dashboardMode, not both.
  aggregationLevel: getFromQueryStringOrDefault('aggregationLevel'),
  product: 'Firefox',
  channel: getFromQueryStringOrDefault('channel'),
  os: getFromQueryString('os') || 'Windows',
  versions: getFromQueryString('versions', true) || [72, 73, 74],
  searchIsActive: false,
  searchQuery: '',
  timeHorizon: getFromQueryString('timeHorizon') || 'MONTH',
  visiblePercentiles: getFromQueryString('visiblePercentiles', true) || [95, 75, 50, 25, 5],
  proportionMetricType: getFromQueryString('proportionMetricType') || 'proportions', //
  activeBuckets: getFromQueryString('activeBuckets', true) || [],
  applicationStatus: 'INITIALIZING', // FIXME: applicationStatus or dashboardMode, not both.
  appView: getFromQueryString('probe') === null || getFromQueryString('probe') === 'null' ? 'DEFAULT' : 'PROBE',
  probeView: getFromQueryString('probeView') || 'explore', // explore / table
};

export const store = createStore(initialState);

store.setProbe = (name) => {
  // get matching probe heree
  const probe = get(probeSet).find((d) => d.name === name);
  store.setField('probe', probe);
  store.setField('appView', 'PROBE');
};

store.reset = () => {
  store.reinitialize();
  store.setField('appView', 'DEFAULT');
  store.setField('probe', { name: null });
  store.setField('probeView', 'explore');
};

export const resetFilters = () => {
  store.setField('channel', getDefaultFieldValue('channel'));
  store.setField('os', getDefaultFieldValue('os'));
  store.setField('aggregationLevel', getDefaultFieldValue('aggregationLevel'));
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
    probe: obj.probe.name,
    os: obj.os,
    aggregationLevel: obj.aggregationLevel,
    timeHorizon: obj.timeHorizon,
    proportionMetricType: obj.proportionMetricType,
    activeBuckets: obj.activeBuckets,
    visiblePercentiles: obj.visiblePercentiles,
    probeView: obj.probeView,
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
  delete params.probeView;
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

// let's determine the probe type here
// so we can handle things accordingly.

// function probeTypeAndKind(probeTypeString) {
//   const [probeType, probeKind] = probeTypeString.split('-');
//   return { probeType, probeKind };
// }


export function isCategorical(probeType, probeKind) {
  return ((probeType === 'histogram' && probeKind === 'enumerated')
  || probeKind === 'categorical' || probeKind === 'flag' || probeKind === 'boolean');
}

export function fetchDataForGLAM(params) {
  return getProbeData(params).then(
    (payload) => {
      // FIXME: this should not be reading from the store.
      // the response is kind of messed up so once the API / data is fixed
      // the response shluld consume from payload.response[0].metric_type.
      // until then, however, we'll have to use the store values
      // for the probeType and probeKind, since they're more accurate than
      // what is in payload.response[0].metric_type.
      const st = get(store);
      const { probe } = st;
      const { aggregationLevel } = st;

      if (!('response' in payload)) {
        const er = new Error('The data for this probe is unavailable.');
        if (!probe.active) er.moreInformation = 'This probe appears to be inactive, so it\'s possible we don\'t have data for it.';
        throw er;
      }

      const probeType = probe.type;
      const probeKind = probe.kind;
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

function intersection(a, b) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return new Set(
    [...a].filter((x) => bSet.has(x)),
  );
}

export function updateStoreAfterDataIsReceived({ data }) {
  const st = store.getState();
  // THIS WILL BE FALSE BECAUSE WE HAVE NOT RECEIVED THE PROBE DATA YET.
  const viewType = getProbeViewType(st.probe.type, st.probe.kind);
  const isCategoricalTypeProbe = viewType === 'categorical';
  let etc = {};
  if (isCategoricalTypeProbe) {
    etc = extractBucketMetadata(data);
  }

  // if the proposed initial buckets have no overlap, reset activeBuckets.
  // if (st.activeBuckets.length === 0 || intersection(st.activeBuckets, etc.initialBuckets).size !== st.activeBuckets.length) {
  if (isCategoricalTypeProbe) store.setField('activeBuckets', etc.initialBuckets);
  // }
  // store.setField('applicationStatus', 'ACTIVE');
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

  const params = getParamsForDataAPI($store);
  const qs = toQueryString(params);

  // // invalid parameters, probe selected.
  if (!paramsAreValid(params) && probeSelected($store.probe.name)) {
    const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
    // store.setField('dashboardMode', message);
    return message;
  }

  // // no probe selected.
  if (!probeSelected($store.probe.name)) {
    const message = datasetResponse('INFO', 'DEFAULT_VIEW');
    // if ($store.dashboardMode.key !== 'DEFAULT_VIEW') {
    //   store.setField('dashboardMode', message);
    // }
    return message;
  }

  if (!(qs in cache)) {
    cache[qs] = fetchDataForGLAM(params, $store);
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
