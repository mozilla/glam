import gleanBase from './glean-base';

export default {
  ...gleanBase,
  label: 'Firefox for Android',
  key: 'fenix',
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
      values: [{ key: 'Android', label: 'Android' }],
      defaultValue: 'Android',
    },
  },
};
