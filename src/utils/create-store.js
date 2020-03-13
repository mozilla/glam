import produce from 'immer';
import { writable, get } from 'svelte/store';

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
    INTERNAL_STORE.update((state) => produce(state, (draft) => {
      draft[key] = value;
    }));
  }

  function connect(func) {
    return (...args) => dispatch(func(...args));
  }

  function reinitialize(include = {}) {
    const nextState = { ...initialStore, ...include };
    INTERNAL_STORE.set(nextState);
  }

  return {
    dispatch,
    connect,
    subscribe: INTERNAL_STORE.subscribe,
    getState,
    setField,
    reinitialize,
  };
}
