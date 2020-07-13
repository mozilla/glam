import { get } from 'svelte/store';
import { extractBucketMetadata } from './shared';
import { transformAPIResponse } from '../utils/transform-data';
import { isSelectedProcessValid } from '../utils/probe-utils';
import { getProbeData } from '../state/api';
import { validate, noResponse } from '../utils/data-validation';

export default {
  sampleRate: 0.1,
  dimensions: {
    os: {
      title: 'OS',
      key: 'os',
      values: [
        { key: '*', label: 'All OSes' },
        { key: 'Windows', label: 'Windows' },
        { key: 'Mac', label: 'Mac' },
        { key: 'Linux', label: 'Linux' },
      ],
      defaultValue: 'Windows',
    },
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
        return (probe.prerelease && key !== 'release') || !probe.prerelease;
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
        return isSelectedProcessValid(probe.record_in_processes, key);
      },
    },
  },
  // the probeView object maps a probe type for this product
  // to one of a few options: "histogram"  "scalar", and "categorical". Quantile type probes
  // are ones whose aggregation makes some kind of histogram-like shape
  // (such as an exponential histogram or a scalar in Firefox Desktop).
  // Probes whose aggregation might look like a bar chart map to "proportion".
  // FIXME: this will probably need to be changed
  // so these histogram / scalar repsonses are actually 'linear' vs. 'log'.
  probeView: {
    'histogram-linear': 'histogram',
    'histogram-exponential': 'histogram',
    'scalar-uint': 'scalar',
    'scalar-boolean': 'categorical',
    'histogram-enumerated': 'categorical',
    'histogram-flag': 'categorical',
    'histogram-boolean': 'categorical',
    'histogram-count': 'categorical',
  },
  getParamsForQueryString(storeValue) {
    // These parameters will map to a ${key}=${value}&... in the querystring,
    // which is used to convey the view state when the GLAM URL is shared with
    // others.
    return {
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
      process: storeValue.productDimensions.process,
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
      product: 'firefox', // FIXME: this should probably be firefoxDesktop.
      channel: storeValue.productDimensions.channel,
      os: storeValue.productDimensions.os,
      probe: storeValue.probeName,
      process: storeValue.productDimensions.process,
      aggregationLevel: storeValue.productDimensions.aggregationLevel,
    };
  },
  fetchData(params, appStore) {
    return getProbeData(params, appStore.getState().auth.token).then(
      (payload) => {
        const { aggregationLevel } = appStore.getState().productDimensions;

        const metricType = payload.response[0].metric_type;
        validate(payload, (p) => noResponse(p));
        const data = transformAPIResponse[
          this.probeView[metricType] === 'categorical'
            ? 'proportion'
            : 'quantile'
        ](payload.response, aggregationLevel, metricType);
        return {
          data,
          probeType: this.probeView[metricType],
        };
      }
    );
  },
  updateStoreAfterDataIsReceived(data, appStore, probeStore) {
    // This function is called directly after the response has been received by
    // the frontend. It will always run, even against cached data, as a way of
    // resetting the necessary state.
    const probeValue = get(probeStore);
    const viewType = this.probeView[data[0].metric_type];

    const isCategoricalTypeProbe = viewType === 'categorical';
    let etc = {};
    if (isCategoricalTypeProbe) {
      etc = extractBucketMetadata(data);
    }

    if (isCategoricalTypeProbe) {
      appStore.setField('activeBuckets', etc.initialBuckets);
    }
    appStore.setField('recordedInProcesses', probeValue.record_in_processes);
    return { data, viewType, ...etc };
  },
  transformProbeForGLAM(probe) {
    // This currently transforms the probe metadata into a more useful format
    // for Firefox desktop. It will likely be unnecessary for other products.
    const pr = { ...probe };
    if (pr.record_in_processes[0] === 'all') {
      pr.record_in_processes = ['main', 'content', 'gpu'];
    }
    if (pr.record_in_processes[0] === 'all_childs') {
      pr.record_in_processes = ['content', 'gpu'];
    }
    return pr;
  },
  setDefaultsForProbe(store, probe) {
    // This currently updates the store to accommodate any needed bits of state
    // for the store before fetching data. It is probably not necessary for
    // non-Firefox desktop products.
    const state = store.getState();
    // accommodate only valid processes.
    if (
      !isSelectedProcessValid(
        probe.record_in_processes,
        state.productDimensions.process
      )
    ) {
      let newProcess = probe.record_in_processes[0];
      if (newProcess === 'main') newProcess = 'parent';
      store.setDimension('process', newProcess);
    }
    // accommodate prerelease-only probes by resetting to nightly (if needed)
    if (state.productDimensions.channel === 'release' && probe.prerelease) {
      store.setDimension('channel', 'nightly');
    }
  },
};
