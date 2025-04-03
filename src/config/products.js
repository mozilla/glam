import fogConfig from './fog';
import fenixConfig from './fenix';
import firefoxConfig from './firefox-desktop';

export const productKeys = [
  { key: 'fenix', label: 'Firefox for Android' },
  { key: 'firefox', label: 'Firefox Desktop' },
];

export default {
  fog: fogConfig,
  fenix: fenixConfig,
  firefox: firefoxConfig,
};
