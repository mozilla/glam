import { get } from 'svelte/store';
import { extractBucketMetadata } from './shared';
import { isSelectedProcessValid, getProbeViewType } from '../utils/probe-utils';

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
    },
    channel: {
      title: 'Channel',
      key: 'channel',
      values: [
        { key: 'nightly', label: 'Nightly' },
        { key: 'beta', label: 'Beta' },
        { key: 'release', label: 'Release' },
      ],
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
    },
    process: {
      title: 'Process',
      key: 'process',
      values: [
        { key: 'parent', label: 'Parent' },
        { key: 'content', label: 'Content' },
        { key: 'gpu', label: 'GPU' },
      ],
      isValidKey(key, probe) {
        return isSelectedProcessValid(probe.record_in_processes, key);
      },
    },
  },
  getParamsForQueryString(store) {
    /* These parameters will map to a ${key}=${value}&... in the querystring,
      which is used to convey the view state when the GLAM url is shared with others.
    */
    return {
      channel: store.productDimensions.channel,
      os: store.productDimensions.os,
      aggregationLevel: store.productDimensions.aggregationLevel,
      process: store.productDimensions.process,
      timeHorizon: store.timeHorizon,
      proportionMetricType: store.proportionMetricType,
      activeBuckets: store.activeBuckets,
      visiblePercentiles: store.visiblePercentiles,
      reference: store.reference,
    };
  },
  getParamsforDataAPI(store) {
    /* These parameters are needed to request the data from the API itself. */
    return {
      channel: store.productDimensions.channel,
      os: store.productDimensions.os,
      probe: store.probeName,
      process: store.productDimensions.process,
      aggregationLevel: store.productDimensions.aggregationLevel,
    };
  },
  updateStoreAfterDataIsReceived(data, appStore, probeStore) {
    /*
      This function is called directly after the response has been received
      by the frontend. It will always run, even against cached data, as a way
      of resetting the necessary state.
    */
    const probeValue = get(probeStore);
    const viewType = getProbeViewType(probeValue.type, probeValue.kind);
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
    /* This currently transforms the probe metadata into a more useful format
      for firefox desktop. It will likely be unnecessary for other products.
    */
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
    /* This currently updatess the store to accommodate any needed
      bits of state for the store before fetching data. It is probably not
      necessary for non-firefox desktop products.
    */
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
