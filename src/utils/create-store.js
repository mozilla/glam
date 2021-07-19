import produce from 'immer';
import { writable, get } from 'svelte/store';

// Workaround to use immer > v.8.x
// https://github.com/immerjs/immer/issues/557#issuecomment-621491287
window.process = {
  env: {
    NODE_ENV: 'production',
  },
};

export function createStore(initialStore) {
  const INTERNAL_STORE = writable(initialStore);
  const getState = () => get(INTERNAL_STORE);

  // FIXME: going to keep dispatch for historical purposes,
  // but in general I think setField below is just far less
  // boilerplate for simple changes to the store.
  // If more complex operations appear in this repository,
  // it might make more sense to go down the dispatch route.
  // These types of data apps are pretty simplistic, however.
  function dispatch(func) {
    // this is really just a slight addendum to update
    // that allows you to pass in produce-friendly functions.
    if (func.constructor.name === 'AsyncFunction') {
      // composite update (thunk). Async may or may not be
      // necessary here, but might as well make all of these async by
      // default.
      func(dispatch, getState);
    } else {
      // atomic update (singular state change).
      INTERNAL_STORE.update((state) => produce(state, func));
    }
  }
  // this is the pattern that @openjck and I worked out
  // on the GUD refactor. It turns out the ultimate way to remove
  // boilerplate is to just make something that simply updates
  // the store as we have it.
  // we call it setField to differentiate it from the store's
  // set function.
  function setField(key, value) {
    INTERNAL_STORE.update((state) =>
      produce(state, (draft) => {
        draft[key] = value;
      })
    );
  }

  function setDimension(key, value) {
    INTERNAL_STORE.update((state) =>
      produce(state, (draft) => {
        // When changing aggregation level, reset zoom states.
        if (key === 'aggregationLevel') {
          draft.hov = '';
          draft.ref = '';
          draft.timeHorizon = 'MONTH';
        }
        draft.productDimensions[key] = value;
      })
    );
  }

  function connect(func) {
    return (...args) => dispatch(func(...args));
  }

  function reinitialize(options = {}) {
    let stateToKeep = {};
    if (options.exceptions) {
      const currentState = getState();
      stateToKeep = options.exceptions.reduce((acc, field) => {
        acc[field] = currentState[field];
        return acc;
      }, {});
    }

    INTERNAL_STORE.set({ ...initialStore, ...stateToKeep });
  }

  function setState(state) {
    INTERNAL_STORE.set(state);
  }

  return {
    dispatch,
    connect,
    subscribe: INTERNAL_STORE.subscribe,
    getState,
    setField,
    setDimension,
    reinitialize,
    setState,
  };
}
