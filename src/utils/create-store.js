/* eslint-disable import/prefer-default-export */
import produce from 'immer';
import { writable, get } from 'svelte/store';

export function createStore(initialStore) {
  const INTERNAL_STORE = writable(initialStore);
  const getState = () => get(INTERNAL_STORE);

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

  function connect(func) {
    return (...args) => dispatch(func(...args));
  }

  return {
    dispatch,
    connect,
    subscribe: INTERNAL_STORE.subscribe,
    getState,
  };
}
