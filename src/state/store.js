import { derived, get, writable } from 'svelte/store';

import { createStore } from '../utils/create-store';

import sharedConfig from '../config/shared';
import productConfig from '../config/products';
import { getMetricKeys } from './api';
import {
  getDualLabeledMainKeys,
  getDualLabeledSubKeys,
  reconstructDualLabeledKey,
} from '../utils/probe-utils';

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

  state.metricKey = getFromQueryString('metricKey') || '';
  state.subMetricKey = getFromQueryString('subMetricKey') || '';
  state.aggType = getFromQueryString('aggType') || 'avg';
  state.currentPage = getFromQueryString('currentPage');
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
const metricKeysCache = {};
let previousQuery;

export const metricKeys = derived([store], ([$store], set) => {
  if (
    $store.probeName === '' ||
    $store.probeName === undefined ||
    !$store.product ||
    !$store.probe ||
    !$store.probe.loaded
  ) {
    return;
  }

  const isLabeledMetric =
    $store.probe.type && $store.probe.type.includes('labeled');

  if (!isLabeledMetric) {
    // For non-labeled metrics, set empty array to indicate no keys needed
    set([]);
    return;
  }

  const activeProductConfig = getActiveProductConfig();
  const params = activeProductConfig.getParamsForDataAPI($store);

  // Only fetch metric keys if we have a valid probe and parameters
  if (!paramsAreValid(params) || !probeSelected($store.probeName)) {
    return;
  }

  const keyParams = {
    product: $store.product,
    channel:
      $store.productDimensions.app_id || $store.productDimensions.channel,
    probe: $store.probeName,
    os: $store.productDimensions.os,
  };

  const keyCacheKey = `${keyParams.product}-${keyParams.channel}-${keyParams.probe}`;

  if (!(keyCacheKey in metricKeysCache)) {
    metricKeysCache[keyCacheKey] = getMetricKeys(keyParams);
  }

  // Resolve the promise and set the result
  metricKeysCache[keyCacheKey]
    .then((keys) => {
      set(keys);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch metric keys:', error);
      set([]);
    });
});

// Processed metric keys for different metric types
export const processedMetricKeys = derived(
  [store, metricKeys],
  ([$store, $metricKeys]) => {
    if (!$metricKeys || $metricKeys.length === 0) {
      return [];
    }

    const isDualLabeledCounter =
      $store.probe && $store.probe.type === 'dual_labeled_counter';

    if (isDualLabeledCounter) {
      // For dual labeled counters, return only the main keys
      return getDualLabeledMainKeys($metricKeys);
    }
    // For regular labeled metrics, return keys as-is
    return $metricKeys;
  }
);

// Sub-keys for dual labeled counters
export const subMetricKeys = derived(
  [store, metricKeys],
  ([$store, $metricKeys]) => {
    if (!$metricKeys || $metricKeys.length === 0 || !$store.metricKey) {
      return [];
    }

    const isDualLabeledCounter =
      $store.probe && $store.probe.type === 'dual_labeled_counter';

    if (isDualLabeledCounter) {
      return getDualLabeledSubKeys($metricKeys, $store.metricKey);
    }
    return [];
  }
);

export const dataset = derived(
  [store, metricKeys],
  ([$store, $metricKeys], set) => {
    // Must wait for info from Dictionary before doing anything
    if (
      $store.probeName === '' ||
      $store.probeName === undefined ||
      !$store.product ||
      !$store.probe ||
      !$store.probe.loaded
    ) {
      // Return a never-resolving promise to keep Probe.svelte in loading state
      set(new Promise(() => {}));
      return;
    }

    // Handle labeled metrics for Glean products
    const isLabeledMetric =
      $store.probe &&
      $store.probe.loaded &&
      $store.probe.type &&
      $store.probe.type.includes('labeled');
    const isDualLabeledCounter =
      $store.probe && $store.probe.type === 'dual_labeled_counter';

    const activeProductConfig = getActiveProductConfig();
    let params = activeProductConfig.getParamsForDataAPI($store);

    // For dual labeled counters, reconstruct the full metric key
    if (isDualLabeledCounter && $store.metricKey && $store.subMetricKey) {
      params = {
        ...params,
        metric_key: reconstructDualLabeledKey(
          $store.metricKey,
          $store.subMetricKey
        ),
      };
    }

    const qs = toQueryString(params);

    // invalid parameters, probe selected.
    if (!paramsAreValid(params) && probeSelected($store.probeName)) {
      const message = datasetResponse('ERROR', 'INVALID_PARAMETERS');
      // eslint-disable-next-line consistent-return
      set(Promise.resolve(message));
      return;
    }

    // no probe selected.
    if (!probeSelected($store.probeName)) {
      const message = datasetResponse('INFO', 'DEFAULT_VIEW');
      // eslint-disable-next-line consistent-return
      set(Promise.resolve(message));
      return;
    }

    if (isLabeledMetric) {
      // Check if this is a static labeled counter (has predefined labels)
      const isStaticLabeledCounter =
        $store.probe.labels !== undefined &&
        $store.probe.labels !== null &&
        $store.probe.labels.length > 0;

      // For static labeled counters, skip key selection and go straight to data
      if (!isStaticLabeledCounter) {
        // For dynamic labeled counters, require key selection
        // If we don't have metric keys yet, don't proceed with data fetching
        if ($metricKeys === undefined) {
          return; // Still loading keys, don't fetch data yet
        }

        // If metricKeys is empty array, it means this probe has no keys to fetch
        if ($metricKeys && $metricKeys.length === 0) {
          // This shouldn't happen for labeled metrics, but handle gracefully
          return;
        }

        // Get processed keys for display
        const displayKeys = isDualLabeledCounter
          ? getDualLabeledMainKeys($metricKeys)
          : $metricKeys;

        // If we have keys but no selection, show message to select
        if (displayKeys && displayKeys.length > 0 && !$store.metricKey) {
          const message = datasetResponse('INFO', 'SELECT_LABEL', {
            keys: displayKeys,
            isDualLabeled: isDualLabeledCounter,
          });
          // eslint-disable-next-line consistent-return
          set(Promise.resolve(message));
          return;
        }

        // If we have a selection but it's not valid, show message to select again
        if (
          displayKeys &&
          displayKeys.length > 0 &&
          $store.metricKey &&
          !displayKeys.includes($store.metricKey)
        ) {
          const message = datasetResponse('INFO', 'SELECT_LABEL', {
            keys: displayKeys,
            isDualLabeled: isDualLabeledCounter,
          });
          // eslint-disable-next-line consistent-return
          set(Promise.resolve(message));
          return;
        }

        // For dual labeled counters, we also need a sub-key selection
        if (isDualLabeledCounter && $store.metricKey && !$store.subMetricKey) {
          const message = datasetResponse('INFO', 'SELECT_SUB_LABEL', {
            mainKey: $store.metricKey,
          });
          // eslint-disable-next-line consistent-return
          set(Promise.resolve(message));
          return;
        }

        // If we reach here for dynamic labeled metrics, we must have a valid metricKey
        // Only proceed with data fetching if we have the required key selection
        if (!$store.metricKey) {
          return; // Don't fetch data without a selected key
        }
      }
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
        cache[qs].then(({ data, probeType }) =>
          activeProductConfig.updateStoreAfterDataIsReceived(
            data,
            probeType,
            store
          )
        )
      );
    }
  }
);

export const currentQuery = derived(store, ($store) => {
  const activeProductConfig = getActiveProductConfig();
  if (!activeProductConfig) return '';
  const params = activeProductConfig.getParamsForQueryString($store);
  return toQueryString(params);
});

export const showContextMenu = writable(false);
