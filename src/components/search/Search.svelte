<script>
import { tick } from 'svelte';
import { fly } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
import SearchIcon from 'udgl/icons/Search.svelte';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';
import { throttle } from 'throttle-debounce';

import TelemetrySearchResults from './SearchResults.svelte';


let inputElement;
let searchContainer;
let results = [];
let searchIsActive = false;
let searchQuery = '';
const SEARCH_THROTTLE_TIME = 500; // how often to send the PSS fetch (in ms)

function turnOnSearch() {
  searchIsActive = true;
}

function unfocus() {
  inputElement.blur();
  searchIsActive = false;
}

async function onKeypress(event) {
  if (searchIsActive) {
    const { key } = event;
    if (key === 'Escape') {
      await tick();
      unfocus();
    }
  }
}

const domain = (str, product = 'desktop') => {
  const formattedStr = str.replace(' ', '%20');
  return `https://dev.probe-search.nonprod.dataops.mozgcp.net/probes?limit=15&select=name,definition,type&product=eq.${product}&or=(name.eq.${formattedStr},index.phfts(english).${formattedStr},description.phfts(english).${formattedStr},name.ilike.${formattedStr}%)`;
};

function probeSearchServiceRequest(str) {
  return results = fetch(domain(str)).then((r) => {
    if (r.ok) return r.json();
    return r;
  });
}

let searchResults = Promise.resolve([]);
let query = '';

const handleSearchInput = throttle(SEARCH_THROTTLE_TIME, ({target: {value}}) => {
  query = value;
  searchResults = probeSearchServiceRequest(query).then((r) => {
    // sort these?
    if (r.constructor === Array) {
      results = r.sort((a, b) => {
        const aHas = a.name.toLowerCase().includes(query);
        const bHas = b.name.toLowerCase().includes(query);
        if (aHas && !bHas) return -1;
        if (bHas && !aHas) return 1;
        return 0;
      });
    } else {
      results = r;
    }
  });
  searchIsActive = true;
}, false);
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
    position: relative;
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

  .search-error-notice {
    position: absolute;
    padding: var(--alert-notice-item-padding);
    background-color: var(--alert-notice-background);
    border: var(--alert-notice-border);
    border-radius: var(--border-radius-base);
    color: var(--alert-notice-text-color);
    font-size: var(--text-015);
    top: 0;
    left: 102%;
    white-space: nowrap;
    z-index: 10;
    box-shadow: var(--depth-small);
  }
</style>

<svelte:window on:keydown={onKeypress} />
<svelte:body on:click={(evt) => {
  if (searchIsActive) {
    if (evt.target !== inputElement) {
      inputElement.blur();
      searchIsActive = false;
    }
  }
}}></svelte:body>

<div class="search-container">
  <div class="inner-container" bind:this={searchContainer}
    aria-expanded={searchIsActive && searchQuery.length}
    aria-haspopup="listbox"
    aria-owns="telemetry-search-results"
  >
    <div class="icon-container">
      <div class="icon" in:fly={{ y: -10, duration: 100 }}>
        <SearchIcon  />
      </div>
    </div>
    <input
      type="search"
      aria-autocomplete="list"
      aria-controls="telemetry-search-results"
      on:focus={turnOnSearch}
      bind:this={inputElement}
      placeholder="search for a telemetry probe"
      value={searchQuery}
      on:input={handleSearchInput}
    />
    {#if results.status}
      <div
        class="search-error-notice"
        transition:fly={{ y: 10, duration: 200, easing: cubicOut }}
      >
        Probe search failed with status {results.status}
      </div>
    {/if}
  </div>
</div>

{#if results.constructor === Array}
  <TelemetrySearchResults
    {query}
    {results}
    bind:searchIsActive
    parentElement={searchContainer}
  />
{/if}


