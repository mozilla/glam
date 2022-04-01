import FIREFOX_DESKTOP from './firefox-desktop';
import { FIREFOX_ON_GLEAN, FENIX } from './glean';

const products = {
  legacy: FIREFOX_DESKTOP,
  fog: FIREFOX_ON_GLEAN,
  fenix: FENIX,
};

export const productKeys = [
  { key: 'firefox', label: 'Firefox Desktop' },
  { key: 'fenix', label: 'Firefox Android' },
];

export default products;
