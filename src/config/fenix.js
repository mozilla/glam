import { transformAPIResponse } from '../utils/transform-data';
import { extractBucketMetadata } from './shared';
import { getProbeData } from '../state/api';
import { validate, noResponse } from '../utils/data-validation';

export default {
  sampleRate: 0.1,
  dimensions: {
    os: {
      title: 'OS',
      key: 'os',
      values: [{ key: 'Android', label: 'Android' }],
    },
    channel: {
      title: 'Channel',
      key: 'channel',
      values: [
        { key: 'fenixProduction', label: 'Firefox Preview' },
        { key: 'release', label: 'Fenix' },
      ],
    },
    pingType: {
      title: 'Ping Type',
      key: 'ping_type',
      values: [
        { key: '*', label: 'All' },
        { key: 'metrics', label: 'Metrics' },
        { key: 'baseline', label: 'Baseline' },
      ],
    },
    aggregationLevel: {
      title: 'Aggregation Level',
      key: 'aggregationLevel',
      values: [
        { key: 'build_id', label: 'Build ID' },
        { key: 'version', label: 'Major Version' },
      ],
    },
  },
  probeView: {
    boolean: 'categorical',
    custom_distribution_exponential: 'log',
    custom_distribution_linear: 'log',
    counter: 'linear',
    timing_distribution: 'linear',
    labeled_counter: 'categorical',
    quantity: 'linear',
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    return {
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      pingType: storeValue.productDimensions.pingType,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      reference: storeValue.reference,
    };
  },
  getParamsForDataAPI(storeValue) {
    // These parameters are needed to request the data from the API itself
    return {
      product: 'fenix',
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      pingType: storeValue.productDimensions.pingType,
      probe: storeValue.probeName,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
    };
  },
  fetchData(params, appStore) {
    // FIXME: this is (so far) identical to firefox-desktop.
    // should we just make this something in shared.js?
    return getProbeData(params, appStore.getState().auth.token).then(
      (payload) => {
        const { aggregationLevel } = appStore.getState().productDimensions;

        const metricType = payload.response[0].metric_type;
        validate(payload, (p) => noResponse(p));
        const viewType =
          this.probeView[metricType] === 'categorical'
            ? 'proportion'
            : 'quantile';
        const data = transformAPIResponse[viewType](
          payload.response,
          aggregationLevel,
          metricType
        );
        return {
          data,
          probeType: this.probeView[metricType],
        };
      }
    );
  },

  updateStoreAfterDataIsReceived(data, appStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const viewType = this.probeView[data[0].metric_type];

    const isCategoricalTypeProbe = viewType === 'categorical';

    let etc = {};
    if (isCategoricalTypeProbe) {
      etc = extractBucketMetadata(data);
    }

    if (isCategoricalTypeProbe) {
      appStore.setField('activeBuckets', etc.initialBuckets);
    }

    return { data, viewType, ...etc };
  },
  transformProbeForGLAM(probe) {
    const pr = { ...probe };
    return pr;
  },
  setDefaultsForProbe() {},
};
