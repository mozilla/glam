import { produce } from 'immer';
import {
  transformBooleanHistogramToCategoricalHistogram,
  transformAPIResponse,
  transformLabeledCounterToCategoricalHistogramSampleCount,
} from '../utils/transform-data';
import { stripDefaultValues } from '../utils/urls';
import sharedDefaults, { extractBucketMetadata } from './shared';
import { getProbeData, getProbeInfo } from '../state/api';
import {
  validate,
  noResponse,
  noUnknownMetrics,
  noMeaningfulData,
} from '../utils/data-validation';
import { filterLowClientBuilds } from '../utils/probe-utils';

export const SUPPORTED_METRICS = [
  'categorical',
  'linear',
  'counter',
  'labeled_counter',
  'dual_labeled_counter',
  'quantity',
  'timespan',
  'custom_distribution',
  'memory_distribution',
  'timing_distribution',
  'labeled_custom_distribution',
  'labeled_timing_distribution',
  'boolean',
];

export default {
  // Common Glean configuration
  dimensions: {
    normalizationType: {
      title: 'Normalization',
      key: 'normalizationType',
      values: [
        { key: 'normalized', label: 'By Client ID' },
        { key: 'non_normalized', label: 'None' },
      ],
      defaultValue: 'normalized',
    },
    app_id: {
      title: 'Channel',
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
        { key: 'Darwin', label: 'Mac' },
        { key: 'Linux', label: 'Linux' },
        { key: 'Android', label: 'Android' },
      ],
      defaultValue: '*',
    },
    ping_type: {
      title: 'Ping Type',
      key: 'ping_type',
      values: [
        { key: '*', label: 'All' },
        { key: 'baseline', label: 'Baseline' },
        { key: 'metrics', label: 'Metrics' },
      ],
      defaultValue: '*',
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

  // Common probe view mappings for Glean metrics
  probeView: {
    boolean: 'categorical',
    counter: 'linear',
    custom_distribution_exponential: 'log',
    custom_distribution_linear: 'linear',
    labeled_counter: (isStatic) => (isStatic ? 'categorical' : 'linear'),
    dual_labeled_counter: 'linear',
    memory_distribution: 'log',
    quantity: 'linear',
    timespan: 'log',
    timing_distribution: 'log',
    labeled_timing_distribution: 'log',
  },

  probeViewFromHistogramTypeMap: {
    exponential: 'log',
    linear: 'linear',
  },

  // Common data fetching and transformation methods
  getParamsForDataAPI(storeValue) {
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

  getParamsForQueryString(storeValue) {
    const params = {
      app_id: storeValue.productDimensions.app_id,
      os: storeValue.productDimensions.os,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      ping_type: storeValue.productDimensions.ping_type,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      ref: storeValue.ref,
      hov: storeValue.hov,
      currentPage: storeValue.currentPage,
      normalizationType: storeValue.productDimensions.normalizationType,
    };
    return stripDefaultValues(params, {
      ...sharedDefaults,
      ...this.dimensions,
    });
  },

  // Common data transformation methods
  transformProbeForGLAM(probe) {
    return probe;
  },

  // Common data fetching logic
  async fetchData(params, appStore) {
    await getProbeInfo(appStore.getState().product, params.probe).then((r) => {
      const newProbe = { ...r, loaded: true };
      appStore.setField('probe', newProbe);
    });

    const metricType = appStore.getState().probe.type;
    const histogramType = appStore.getState().probe.histogram_type;
    let probeView = this.getViewFromMetricType(metricType)
      ? this.getViewFromMetricType(metricType)
      : this.probeViewFromHistogramTypeMap[histogramType];
    if (metricType === 'labeled_counter') {
      const isStatic =
        appStore.getState().probe.labels !== null &&
        appStore.getState().probe.labels.length > 0;
      probeView = this.getViewFromMetricType(metricType, isStatic);
    }
    noUnknownMetrics(metricType, SUPPORTED_METRICS);

    return getProbeData(params).then((payload) => {
      const { aggregationLevel } = appStore.getState().productDimensions;
      const channel = params.app_id;

      validate(payload, (p) => {
        noResponse(p);
        noUnknownMetrics(metricType, SUPPORTED_METRICS);
      });
      const viewType = probeView === 'categorical' ? 'proportion' : 'quantile';
      let data = payload.response;

      if (channel === 'nightly') {
        data = filterLowClientBuilds(payload.response);
        validate(data, (d) => {
          noMeaningfulData(d);
        });
      }

      appStore.setField('viewType', viewType);
      appStore.setField('aggMethod', data[0].client_agg_type);

      // Attach labels to histogram if appropriate type.
      if (probeView === 'categorical') {
        let labels = {
          ...appStore.getState().probe.labels,
        };
        if (metricType === 'boolean') {
          const dataAndLabels =
            transformBooleanHistogramToCategoricalHistogram(data);
          data = dataAndLabels.data;
          labels = dataAndLabels.labels;
        }
        if (metricType === 'labeled_counter') {
          data = transformLabeledCounterToCategoricalHistogramSampleCount(
            data,
            labels
          );
          if (channel === 'nightly') {
            data = filterLowClientBuilds(data);
          }
        }
        data = produce(data, (draft) =>
          draft.map((point) => ({
            ...point,
            histogram: Object.entries(point.histogram).reduce(
              (acc, [bin, value]) => {
                const intBin = Math.floor(bin);
                if (intBin in labels) {
                  acc[labels[intBin]] = value;
                }
                return acc;
              },
              {}
            ),
            non_norm_histogram: Object.entries(point.non_norm_histogram).reduce(
              (acc, [bin, value]) => {
                const intBin = Math.floor(bin);
                if (intBin in labels) {
                  acc[labels[intBin]] = value;
                }
                return acc;
              },
              {}
            ),
          }))
        );
      }
      data = transformAPIResponse[viewType](data, aggregationLevel, metricType);
      return {
        data,
        probeType: probeView,
        viewType,
      };
    });
  },

  // Common store update logic
  updateStoreAfterDataIsReceived(data, probeType, appStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const viewType = probeType;
    const metricType = appStore.getState().probe.type;
    let etc = {};

    // filter out true/false aggregate results in boolean metrics. See: https://github.com/mozilla/glam/pull/1525#discussion_r694135079
    if (metricType === 'boolean') {
      // eslint-disable-next-line no-param-reassign
      data = data.filter((di) => di.client_agg_type === '');
    }

    if (viewType === 'categorical') {
      etc = extractBucketMetadata(data);
      appStore.setField('activeBuckets', etc.initialBuckets);
    }

    return { data, viewType, ...etc };
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

  getViewFromMetricType(metricType, isStatic = false) {
    if (typeof this.probeView[metricType] === 'function') {
      return this.probeView[metricType](isStatic);
    }
    return this.probeView[metricType];
  },
};
