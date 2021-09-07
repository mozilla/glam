import produce from 'immer';
import sharedDefaults, { extractBucketMetadata } from './shared';
import { stripDefaultValues } from '../utils/urls';
import { transformAPIResponse } from '../utils/transform-data';
import { isSelectedProcessValid } from '../utils/probe-utils';
import { getProbeData } from '../state/api';
import {
  validate,
  noResponse,
  noUnknownMetrics,
} from '../utils/data-validation';

export default {
  label: 'Firefox Desktop',
  key: 'firefox',
  sampleRate: 0.1,
  dimensions: {
    channel: {
      title: 'Channel',
      key: 'channel',
      values: [
        { key: 'nightly', label: 'Nightly' },
        { key: 'beta', label: 'Beta' },
        { key: 'release', label: 'Release' },
      ],
      defaultValue: 'nightly',
      isValidKey(key, probe) {
        return key in probe.info.history;
      },
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
    process: {
      title: 'Process',
      key: 'process',
      values: [
        { key: 'parent', label: 'Parent' },
        { key: 'content', label: 'Content' },
        { key: 'gpu', label: 'GPU' },
      ],
      defaultValue: 'content',
      isValidKey(key, probe) {
        return isSelectedProcessValid(
          probe.info.calculated.seen_in_processes,
          key
        );
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
  // the probeView object maps a probe type for this product
  // to one of a few options: "linear"  "log", and "categorical". Quantile type probes
  // are ones whose aggregation makes some kind of histogram-like shape
  // (such as an exponential histogram or a scalar in Firefox Desktop).
  // Probes whose aggregation might look like a bar chart map to "proportion".
  probeView: {
    // 'boolean': 'categorical', // TODO: These are differently shaped than histogram-boolean.
    'histogram-boolean': 'categorical',
    'histogram-categorical': 'categorical',
    'histogram-count': 'categorical',
    'histogram-enumerated': 'categorical',
    'histogram-exponential': 'log',
    'histogram-flag': 'categorical',
    'histogram-linear': 'linear',
    'keyed-scalar': 'linear',
    'scalar-boolean': 'categorical',
    'scalar-uint': 'linear',
    scalar: 'linear',
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    const params = {
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      process: storeValue.productDimensions.process,
      timeHorizon: storeValue.timeHorizon,
      proportionMetricType: storeValue.proportionMetricType,
      activeBuckets: storeValue.activeBuckets,
      visiblePercentiles: storeValue.visiblePercentiles,
      ref: storeValue.ref,
      hov: storeValue.hov,
    };
    return stripDefaultValues(params, {
      ...sharedDefaults,
      ...this.dimensions,
    });
  },
  getParamsForDataAPI(storeValue) {
    // These parameters are needed to request the data from the API itself
    return {
      product: 'firefox', // FIXME: this should probably be firefoxDesktop.
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      probe: storeValue.probeName,
      process: storeValue.productDimensions.process,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      versions: 10,
    };
  },
  fetchData(params, appStore) {
    return getProbeData(params).then((payload) => {
      const { aggregationLevel } = appStore.getState().productDimensions;

      const metricType = payload.response[0].metric_type;
      validate(payload, (p) => {
        noResponse(p);
        noUnknownMetrics(p, Object.keys(this.probeView));
      });
      const viewType =
        this.probeView[metricType] === 'categorical'
          ? 'proportion'
          : 'quantile';

      appStore.setField('viewType', viewType);

      let data = payload.response;

      // Attach labels to histogram if appropriate type.
      if (metricType === 'histogram-categorical') {
        const labels = {
          ...appStore.getState().probe.info.calculated.latest_history.details
            .labels,
        };
        data = produce(data, (draft) =>
          draft.map((point) => ({
            ...point,
            histogram: Object.entries(point.histogram).reduce(
              (acc, [bin, value]) => {
                if (bin in labels) {
                  acc[labels[bin]] = value;
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
        probeType: this.probeView[metricType],
      };
    });
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
      appStore.setField('activeBuckets', etc.initialBuckets);
    }
    return { data, viewType, ...etc };
  },
  setDefaultsForProbe(store) {
    // This currently updates the store to accommodate any needed bits of state
    // for the store before fetching data. It is probably not necessary for
    // non-Firefox desktop products.
    const state = store.getState();
    const { probe } = state; // accommodate only valid processes.
    if (
      !isSelectedProcessValid(
        probe.info.calculated.seen_in_processes,
        state.productDimensions.process
      )
    ) {
      const newProcess = probe.info.calculated.seen_in_processes[0];
      store.setDimension('process', newProcess);
    }
    // If channel isn't included in history, reset state to channel that is
    if (!(state.productDimensions.channel in probe.info.history)) {
      store.setDimension('channel', Object.keys(probe.info.history)[0]);
    }
    // accommodate prerelease-only probes by resetting to nightly (if needed)
    if (
      state.productDimensions.channel === 'release' &&
      'release' in probe.info.history &&
      !probe.info.history.release[0].optout
    ) {
      store.setDimension('channel', 'nightly');
    }
  },
};
