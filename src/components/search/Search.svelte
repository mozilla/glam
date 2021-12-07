<script>
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { debounce } from 'lodash';
  import { Search as SearchIcon } from '@graph-paper/icons';

  import LineSegSpinner from '../LineSegSpinner.svelte';
  import { getSearchResults } from '../../state/api';
  import TelemetrySearchResults from './SearchResults.svelte';
  import { store } from '../../state/store';

  let inputElement;
  let searchContainer;
  let results = [];
  let searchIsActive = false;
  let searchQuery = '';

  const SEARCH_DEBOUNCE_TIME = 100; // defer getting search results until user input has stopped for a short interval

  function turnOnSearch() {
    searchIsActive = true;
  }

  function unfocus() {
    inputElement.blur();
    searchIsActive = false;
  }

  async function onKeypress({ key }) {
    if (searchIsActive) {
      if (key === 'Escape') {
        await tick();
        unfocus();
      }
    }
  }

  // Toggles spinner in search box during search throttle.
  let searchWaiting = false;

  let query = '';

  const handleSearchInput = debounce((value) => {
    query = value;
    getSearchResults($store.searchProduct, query).then((r) => {
      results = r;
      searchWaiting = false;
    });
    searchIsActive = true;
  }, SEARCH_DEBOUNCE_TIME);
</script>

<style>
  .search-container {
    --input-background-color: var(--blue-slate-500);
    --input-blur-border-color: var(--line-gray-01);
    --input-blur: var(--line-gray-01);
    --input-focus-border-color: var(--blue-slate-300);
    --input-focus: var(--line-gray-01);
    --width: var(--space-72x);

    background-color: var(--blue-slate-700);
    height: var(--increment);
    display: grid;
    align-items: center;
    justify-items: center;
  }

  .inner-container {
    height: calc(var(--space-base) * 4);
    box-shadow: var(--depth-medium);
    display: grid;
    grid-template-columns: [icon] 40px [input] auto;
    align-items: stretch;
    background-color: var(--input-background-color);
    border-radius: var(--space-1h);
  }

  .icon-container {
    position: relative;
    display: grid;
    align-items: center;
    justify-items: center;
  }

  .icon {
    position: absolute;
    display: grid;
    align-items: center;
    justify-items: center;
    opacity: 0.5;
  }

  input {
    border: 2px solid transparent;
    background: var(--input-background-color);
    display: block;
    box-sizing: border-box;
    width: calc(var(--width) + var(--space-2x));
    height: 100%;
    font-size: 1em;
    padding-left: 40px;
    margin-left: -40px;
    padding-right: 54px;
    color: var(--input-blur);
    border-radius: var(--space-1h);
  }

  input:focus {
    color: var(--input-focus);
    border: 2px solid var(--input-focus-border-color);
    transition: border 200ms;
  }
</style>

<svelte:window on:keydown={onKeypress} />
<svelte:body
  on:click={(evt) => {
    if (searchIsActive) {
      if (evt.target !== inputElement) {
        inputElement.blur();
        searchIsActive = false;
      }
    }
  }} />

<div class="search-container">
  <div
    class="inner-container"
    bind:this={searchContainer}
    aria-expanded={searchIsActive && searchQuery.length}
    aria-haspopup="listbox"
    aria-owns="telemetry-search-results">
    <div class="icon-container">
      {#if !searchWaiting}
        <div class="icon" in:fade>
          <SearchIcon />
        </div>
      {:else}
        <div class="icon" in:fade>
          <LineSegSpinner />
        </div>
      {/if}
    </div>
    <input
      type="search"
      aria-autocomplete="list"
      aria-controls="telemetry-search-results"
      on:focus={turnOnSearch}
      bind:this={inputElement}
      placeholder="search for a telemetry probe"
      value={searchQuery}
      on:input={(evt) => {
        searchWaiting = true;
        handleSearchInput(evt.target.value);
      }} />
  </div>
</div>

{#if results.constructor === Array || results.status}
  <TelemetrySearchResults
    {query}
    {results}
    bind:searchIsActive
    parentElement={searchContainer} />
{/if}
