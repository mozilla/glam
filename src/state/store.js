import { derived, get, writable } from 'svelte/store';

import { createStore } from '../utils/create-store';

import sharedConfig from '../config/shared';
import productConfig from '../config/products';

export function getFromQueryString(fieldKey, isMulti = false) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(fieldKey);
  if (isMulti) {
    return JSON.parse(value);
  }
  return value;
}

function getDefaultState(
  { basedOnQueryParams } = { basedOnQueryParams: false }
) {
  const state = {};

  // Grab a valid product from the URL or default to "firefox". Among other
  // things, this enables the use of Storybook. (We have little control over
  // Storybook's URL.)
  const firstPathComponent = window.location.pathname.split('/')[1];

  const searchProducts = {
    firefox: 'firefox',
    fog: 'firefox',
    fenix: 'fenix',
  };

  if (Object.keys(productConfig).includes(firstPathComponent)) {
    state.product = firstPathComponent;
  } else {
    state.product = 'firefox';
  }

  state.probeName = '';
  state.ref = getFromQueryString('ref') || '';
  state.hov = getFromQueryString('hov') || '';
  state.timeHorizon = getFromQueryString('timeHorizon') || 'MONTH';
  state.route = {};
  state.searchProduct = searchProducts[state.product];

  state.aggKey = getFromQueryString('aggKey') || '';
  state.aggType = getFromQueryString('aggType') || 'avg';
  state.currentPage = getFromQueryString('currentPage') || '1';
  state.countView = getFromQueryString('countView') || 'clients';

  state.probe = {
    name: '',
    loaded: false,
  };

  // Shared config
  Object.entries(sharedConfig).forEach(([key, { isMulti, defaultValue }]) => {
    if (basedOnQueryParams) {
      state[key] = getFromQueryString(key, isMulti) || defaultValue;
    } else {
      state[key] = defaultValue;
    }
  });

  // Product config
  state.productDimensions = {};
  if (state.product) {
    Object.entries(productConfig[state.product].dimensions).forEach(
      ([key, { defaultValue }]) => {
        if (basedOnQueryParams) {
          state.productDimensions[key] =
            getFromQueryString(key) || defaultValue;
        } else {
          state.productDimensions[key] = defaultValue;
        }
      }
    );
  }

  return state;
}

export const store = createStore(getDefaultState({ basedOnQueryParams: true }));

store.reset = (home = false) => {
  if (home) {
    // if user clicks on home page, reset state to not include query params
    store.setState(getDefaultState());
  } else {
    store.reinitialize();
  }
};

export function getActiveProductConfig() {
  return productConfig[get(store).product];
}

// functions for selecting product dimension values
// out of the current active product config.
export const productConfigDimensions = {
  dimension(dimensionKey) {
    const activeProductConfig = getActiveProductConfig();
    return activeProductConfig.dimensions[dimensionKey];
  },
  dimensionValue(dimensionKey, valueKey) {
    return this.dimension(dimensionKey).values.find((v) => v.key === valueKey);
  },
  dimensionValueLabel(dimensionKey, valueKey) {
    const value = this.dimensionValue(dimensionKey, valueKey);
    return value ? value.label : undefined;
  },
  isValidDimension(dimensionKey) {
    const activeProductConfig = getActiveProductConfig();
    return Object.keys(activeProductConfig.dimensions).includes(dimensionKey);
  },
  isValidDimensionValue(dimensionKey, valueKey) {
    const field = this.dimension(dimensionKey);
    if (field.skipValidation) return true;
    return field.values.map((fv) => fv.key).includes(valueKey);
  },
};

export function getFromQueryStringOrDefault(fieldKey, isMulti = false) {
  const value = getFromQueryString(fieldKey, isMulti);
  if (!value) {
    return productConfigDimensions.dimension(fieldKey).values[0].key;
  }
  return value;
}

store.setProduct = (product) => {
  store.setField('product', product);
  store.setField('productDimensions', {});

  const config = getActiveProductConfig();
  Object.entries(config.dimensions).forEach(([key, { defaultValue }]) => {
    store.setDimension(key, defaultValue);
  });
};

export const hasDefaultControlFields = derived(store, ($store) => {
  const activeProductConfig = getActiveProductConfig();
  return Object.values(activeProductConfig.dimensions).every(
    (field) =>
      !field.values ||
      field.skipValidation === true ||
      field.values[0].key === $store[field.key]
  );
});

// ///// probe querying infrastructure.

const toQueryStringPair = (k, v) => {
  if (Array.isArray(v)) {
    return `${k}=${encodeURIComponent(JSON.stringify(v))}`;
  }
  return `${k}=${encodeURIComponent(v)}`;
};

export function toQueryString(params) {
  const keys = Object.keys(params);
  keys.sort();
  return `?${keys.map((k) => toQueryStringPair(k, params[k])).join('&')}`;
}

function probeSelected(probeValue) {
  return (
    probeValue !== undefined && probeValue !== 'null' && probeValue !== null
  );
}

function paramsAreValid(params) {
  return (
    Object.entries(params)
      .filter(([k]) => productConfigDimensions.isValidDimension(k))
      .every(([fieldKey, valueKey]) =>
        productConfigDimensions.isValidDimensionValue(fieldKey, valueKey)
      ) && probeSelected(params.probe)
  );
}

export const datasetResponse = (level, key, data) => ({ level, key, data });

const cache = {};
let previousQuery;

export const dataset = derived([store], ([$store], set) => {
  if (
    $store.probeName === '' ||
    $store.probeName === undefined ||
    !$store.product
  ) {
    return;
  }

  const activeProductConfig = getActiveProductConfig();
  const params = activeProductConfig.getParamsForDataAPI($store);
  const qs = toQueryString(params);

  // invalid parameters, probe selected.
  if (!paramsAreValid(params) && probeSelected($store.probeName)) {
    const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
    // eslint-disable-next-line consistent-return
    return message;
  }

  // no probe selected.
  if (!probeSelected($store.probeName)) {
    const message = datasetResponse('INFO', 'DEFAULT_VIEW');
    // eslint-disable-next-line consistent-return
    return message;
  }

  if (!(qs in cache)) {
    cache[qs] = activeProductConfig.fetchData(params, store);
  }

  // compare the previousQuery to the current one.
  // if the actual query params have changed, let's update the
  // data set.
  if (previousQuery !== qs) {
    previousQuery = qs;
    set(
      cache[qs].then(({ data }) =>
        activeProductConfig.updateStoreAfterDataIsReceived(data, store)
      )
    );
  }
});

export const currentQuery = derived(store, ($store) => {
  const activeProductConfig = getActiveProductConfig();
  if (!activeProductConfig) return '';
  const params = activeProductConfig.getParamsForQueryString($store);
  return toQueryString(params);
});

export const showContextMenu = writable(false);
