export default {
  sampleRate: 0.1,
  dimensions: {
    os: {
      title: 'Operating System',
      key: 'os',
      values: [
        { key: 'ALL', label: 'All OSes', keyTransform: 'NULL' },
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
    },
    aggregationLevel: {
      title: 'Aggregation Level',
      key: 'aggregationLevel',
      values: [
        { key: 'build_id', label: 'by build id' },
        { key: 'version', label: 'by major version' },
      ],
    },
    process: {
      title: 'Process',
      key: 'process',
      values: [
        { key: 'parent', label: 'Parent Process' },
        { key: 'content', label: 'Content Process' },
        { key: 'gpu', label: 'GPU Process' },
      ],
    },
  },
};
