import { transformAPIResponse } from '../utils/transform-data';
import { stripDefaultValues } from '../utils/urls';
import sharedDefaults, { extractBucketMetadata } from './shared';
import { getProbeData, getProbeInfo } from '../state/api';

import {
  validate,
  noResponse,
  noUnknownMetrics,
} from '../utils/data-validation';

export const SUPPORTED_METRICS = [
  'categorical',
  'linear',
  'custom_distribution',
  'labeled_counter',
  'memory_distribution',
  'quantity',
  'timespan',
  'timing_distribution',
];

export const FIREFOX_ON_GLEAN = {
  label: 'Firefox on Glean',
  key: 'fog',
  sampleRate: 1,
  dimensions: {
    app_id: {
      title: 'App',
      key: 'app_id',
      values: [
        { key: 'nightly', label: 'Nightly' },
        { key: 'beta', label: 'Beta' },
        { key: 'release', label: 'Release' },
      ],
      defaultValue: 'nightly',
    },
    os: {
      title: 'OS',
      key: 'os',
      values: [
        { key: '*', label: 'All OSes' },
        { key: 'Windows', label: 'Windows' },
        { key: 'Mac', label: 'Mac' },
        { key: 'Linux', label: 'Linux' },
      ],
      defaultValue: '*',
    },
    ping_type: {
      title: 'Ping Type',
      key: 'ping_type',
      values: [
        { key: '*', label: 'All' },
        { key: 'metrics', label: 'Metrics' },
        { key: 'baseline', label: 'Baseline' },
      ],
      defaultValue: 'metrics',
      isValidKey(key, probe) {
        return key === '*' ? true : probe.send_in_pings.includes(key);
      },
    },
    aggregationLevel: {
      title: 'Aggregation Level',
      key: 'aggregationLevel',
      values: [
        { key: 'build_id', label: 'Build ID' },
        { key: 'version', label: 'Major Version' },
      ],
      defaultValue: 'build_id',
    },
  },
  // FIXME: these are guesses at the moment
  probeView: {
    boolean: 'categorical',
    counter: 'linear',
    custom_distribution_exponential: 'log',
    custom_distribution_linear: 'linear',
    labeled_counter: 'linear',
    memory_distribution: 'log',
    quantity: 'linear',
    timespan: 'log',
    timing_distribution: 'log',
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    const params = {
      app_id: storeValue.productDimensions.app_id,
      os: storeValue.productDimensions.os,
      ping_type: storeValue.productDimensions.ping_type,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      ref: storeValue.ref,
      aggKey: storeValue.aggKey,
      aggType: storeValue.aggType,
      currentPage: storeValue.currentPage,
    };
    return stripDefaultValues(params, {
      ...sharedDefaults,
      ...this.dimensions,
    });
  },
  getParamsForDataAPI(storeValue) {
    // These parameters are needed to request the data from the API itself
    return {
      product: storeValue.product,
      app_id: storeValue.productDimensions.app_id,
      os: storeValue.productDimensions.os,
      ping_type: storeValue.productDimensions.ping_type,
      probe: storeValue.probeName,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      versions: 20,
    };
  },
  async fetchData(params, appStore) {
    await getProbeInfo(appStore.getState().product, params.probe).then((r) => {
      const newProbe = { ...r, loaded: true };
      appStore.setField('probe', newProbe);
    });

    const metricType = appStore.getState().probe.type;
    noUnknownMetrics(SUPPORTED_METRICS, metricType);

    return getProbeData(params).then((payload) => {
      const { aggregationLevel } = appStore.getState().productDimensions;

      validate(payload, (p) => {
        noResponse(p);
        noUnknownMetrics(SUPPORTED_METRICS, metricType);
      });
      const viewType =
        this.probeView[metricType] === 'categorical'
          ? 'proportion'
          : 'quantile';

      appStore.setField('viewType', viewType);
      appStore.setField('aggMethod', payload.response[0].client_agg_type);

      const data = transformAPIResponse[viewType](
        payload.response,
        aggregationLevel,
        metricType
      );
      return {
        data,
        probeType: this.probeView[metricType],
      };
    });
  },

  updateStoreAfterDataIsReceived(data, appStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const viewType = this.probeView[data[0].metric_type];
    let etc = {};

    // filter out true/false aggregate results in boolean metrics. See: https://github.com/mozilla/glam/pull/1525#discussion_r694135079
    if (data[0].metric_type === 'boolean') {
      // eslint-disable-next-line no-param-reassign
      data = data.filter((di) => di.client_agg_type === '');
    }

    if (viewType === 'categorical') {
      etc = extractBucketMetadata(data);
      appStore.setField('activeBuckets', etc.initialBuckets);
    }

    return { data, viewType, ...etc };
  },
  transformProbeForGLAM(probe) {
    const pr = { ...probe };
    return pr;
  },
  setDefaultsForProbe(store) {
    const state = store.getState();
    const { probe } = state;
    if (!probe.send_in_pings.includes(state.productDimensions.ping_type)) {
      // Try not to pick the 'All' option, at first.
      const index = probe.send_in_pings.length > 1 ? 1 : 0;
      let newPingtype = probe.send_in_pings[index];
      if (
        !Object.keys(this.dimensions.ping_type.values).includes(newPingtype)
      ) {
        // We don't know about this ping type, default to 'All'.
        newPingtype = '*';
      }
      store.setDimension('ping_type', newPingtype);
    }
  },
};

export const FENIX = {
  label: 'Firefox Android',
  key: 'fenix',
  sampleRate: 1,
  dimensions: {
    app_id: {
      title: 'App',
      key: 'app_id',
      values: [
        { key: 'nightly', label: 'Nightly' },
        { key: 'beta', label: 'Beta' },
        { key: 'release', label: 'Release' },
      ],
      defaultValue: 'nightly',
    },
    os: {
      title: 'OS',
      key: 'os',
      values: [{ key: 'Android', label: 'Android' }],
      defaultValue: 'Android',
    },
    ping_type: {
      title: 'Ping Type',
      key: 'ping_type',
      values: [
        { key: '*', label: 'All' },
        { key: 'baseline', label: 'Baseline' },
        { key: 'metrics', label: 'Metrics' },
        { key: 'first-session', label: 'First Session' },
        { key: 'migration', label: 'Migration' },
      ],
      defaultValue: 'metrics',
      isValidKey(key, probe) {
        return key === '*' ? true : probe.send_in_pings.includes(key);
      },
    },
    aggregationLevel: {
      title: 'Aggregation Level',
      key: 'aggregationLevel',
      values: [
        { key: 'build_id', label: 'Build ID' },
        { key: 'version', label: 'Major Version' },
      ],
      defaultValue: 'build_id',
    },
  },
  // FIXME: these are guesses at the moment
  probeView: {
    boolean: 'categorical',
    counter: 'linear',
    custom_distribution_exponential: 'log',
    custom_distribution_linear: 'linear',
    labeled_counter: 'linear',
    memory_distribution: 'log',
    quantity: 'linear',
    timespan: 'log',
    timing_distribution: 'log',
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    const params = {
      app_id: storeValue.productDimensions.app_id,
      os: storeValue.productDimensions.os,
      ping_type: storeValue.productDimensions.ping_type,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      ref: storeValue.ref,
      aggKey: storeValue.aggKey,
      aggType: storeValue.aggType,
      currentPage: storeValue.currentPage,
    };
    return stripDefaultValues(params, {
      ...sharedDefaults,
      ...this.dimensions,
    });
  },
  getParamsForDataAPI(storeValue) {
    // These parameters are needed to request the data from the API itself
    return {
      product: storeValue.product,
      app_id: storeValue.productDimensions.app_id,
      os: storeValue.productDimensions.os,
      ping_type: storeValue.productDimensions.ping_type,
      probe: storeValue.probeName,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      versions: 20,
    };
  },
  async fetchData(params, appStore) {
    await getProbeInfo(appStore.getState().product, params.probe).then((r) => {
      const newProbe = { ...r, loaded: true };
      appStore.setField('probe', newProbe);
    });

    const metricType = appStore.getState().probe.type;
    noUnknownMetrics(SUPPORTED_METRICS, metricType);

    return getProbeData(params).then((payload) => {
      const { aggregationLevel } = appStore.getState().productDimensions;

      validate(payload, (p) => {
        noResponse(p);
        noUnknownMetrics(SUPPORTED_METRICS, metricType);
      });
      const viewType =
        this.probeView[metricType] === 'categorical'
          ? 'proportion'
          : 'quantile';

      appStore.setField('viewType', viewType);
      appStore.setField('aggMethod', payload.response[0].client_agg_type);

      const data = transformAPIResponse[viewType](
        payload.response,
        aggregationLevel,
        metricType
      );
      return {
        data,
        probeType: this.probeView[metricType],
      };
    });
  },

  updateStoreAfterDataIsReceived(data, appStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const viewType = this.probeView[data[0].metric_type];
    let etc = {};

    // filter out true/false aggregate results in boolean metrics. See: https://github.com/mozilla/glam/pull/1525#discussion_r694135079
    if (data[0].metric_type === 'boolean') {
      // eslint-disable-next-line no-param-reassign
      data = data.filter((di) => di.client_agg_type === '');
    }

    if (viewType === 'categorical') {
      etc = extractBucketMetadata(data);
      appStore.setField('activeBuckets', etc.initialBuckets);
    }

    return { data, viewType, ...etc };
  },
  transformProbeForGLAM(probe) {
    const pr = { ...probe };
    return pr;
  },
  setDefaultsForProbe(store) {
    const state = store.getState();
    const { probe } = state;
    if (!probe.send_in_pings.includes(state.productDimensions.ping_type)) {
      // Try not to pick the 'All' option, at first.
      const index = probe.send_in_pings.length > 1 ? 1 : 0;
      let newPingtype = probe.send_in_pings[index];
      if (
        !Object.keys(this.dimensions.ping_type.values).includes(newPingtype)
      ) {
        // We don't know about this ping type, default to 'All'.
        newPingtype = '*';
      }
      store.setDimension('ping_type', newPingtype);
    }
  },
};
