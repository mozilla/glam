import FIREFOX_DESKTOP from './firefox-desktop';
import FENIX from './fenix';

const products = {
  firefox: FIREFOX_DESKTOP,
  fenix: FENIX,
};

export const productKeys = Object.values(products).map((product) => ({
  label: product.label,
  key: product.key,
}));

export default products;
