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
    },
  },
};
