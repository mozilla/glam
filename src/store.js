import { writable, derived, get } from 'svelte/store';
import produce from 'immer';

export const options = {
  metric: ['gc_ms', 'memory_resident_fast', 'moz_sqlite_places_write_ms'],
  channel: ['release', 'beta', 'nightly'],
  version: ['70', '69', '68'],
  isWaiting: false,
};

const initStore = {
  metric: 'gc_ms',
  channel: 'nightly',
  version: '70',
};

// here, we will separate out subscribe from update.
const STORE = writable(initStore);

// this works very similar to what you'd expect in a redux setting.
// eg. dispatch(changeChannel('beta')) should take the changeChannel
// action, which returns a draft-mutating function to be fed into
// immer's produce function.
export const dispatch = (func) => {
  // I thought about using func.length (if it has two args, then we are go)
  // but you may only have one. For now, I think marking a function a async
  // works.
  if (func.constructor.name === 'AsyncFunction') {
    // composite update (thunk). Async may or may not be
    // necessary here, but might as well make all of these async by
    // default.
    func(dispatch, () => get(STORE));
  } else {
    // atomic update (singular state change).
    STORE.update((state) => produce(state, func));
  }
};

// connect is a way to return a new function that takes in arguments
// and calls dispatch explicitly.
export const connect = (func) => (...args) => dispatch(func(...args));

export const changeMetric = (m) => (draft) => {
  draft.metric = m; // eslint-disable-line no-param-reassign
};
export const changeChannel = (ch) => (draft) => {
  draft.channel = ch; // eslint-disable-line no-param-reassign
};
export const changeVersion = (v) => (draft) => {
  draft.version = v; // eslint-disable-line no-param-reassign
};

export const setAPIWaitingStatus = (tf) => (draft) => {
  draft.isWaiting = tf; // eslint-disable-line no-param-reassign
};

// let's select out just just parts of the state we want to add to the queryString.

export const serverParams = derived(STORE, ($st) => ({
  metric: $st.metric,
  channel: $st.channel,
  version: $st.version,
}));

// make the querystring portion off of serverParams.

export const queryString = derived(serverParams, ($params) => {
  const keys = Object.keys($params).sort();
  return keys.map((k) => `${k}=${$params[k]}`).join('&');
});

// we default export only the subscribe function.
// This makes the store somewhat read-only by nature, since
// the components that will use the store can only read from it.
// See https://svelte.dev/tutorial/custom-stores for an example of
// this pattern in action (albeit done from a different perspective.)
export default { subscribe: STORE.subscribe };


function createDataStore() {
  const { subscribe, set, update } = writable({});

  return {
    subscribe,
    storeData: (data) => update((d) => data), // eslint-disable-line no-unused-vars
    clearData: () => set({}),
  };
}

export const DATA = createDataStore();
