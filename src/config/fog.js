import gleanBase from './glean-base';

export default {
  ...gleanBase,
  label: 'Firefox on Glean',
  key: 'fog',
  dimensions: {
    ...gleanBase.dimensions,
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
        { key: 'Mac', label: 'Mac' },
        { key: 'Linux', label: 'Linux' },
      ],
      defaultValue: '*',
    },
    ping_type: {
      title: 'Ping Type',
      key: 'ping_type',
      values: [
        { key: 'baseline', label: 'Baseline' },
        { key: 'metrics', label: 'Metrics' },
        { key: '*', label: 'All' },
      ],
      defaultValue: '*',
    },
  },
};
