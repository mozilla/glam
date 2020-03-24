<script>
  import { tick } from 'svelte';
import { fly } from 'svelte/transition';
import SearchIcon from 'udgl/icons/Search.svelte';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';

import {
    store,
} from '../../state/store';


import telemetrySearch from '../../state/telemetry-search';

import TelemetrySearchResults from './SearchResults.svelte';


let inputElement;
let searchContainer;

function turnOnSearch() {
    store.setField('searchIsActive', true);
}

function unfocus() {
    inputElement.blur();
    store.setField('searchIsActive', false);
}

async function onKeypress(event) {
    if ($store.searchIsActive) {
      const { key } = event;
      if (key === 'Escape') {
        await tick();
        unfocus();
      }
    }
}

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
<svelte:body on:click={(evt) => {
  if ($store.searchIsActive) {
    if (evt.target !== inputElement) {
      inputElement.blur();
      store.setField('searchIsActive', false);
    }
  }
}}></svelte:body>

<div class=search-container>
  <div class=inner-container bind:this={searchContainer}
    aria-expanded={!!($store.searchIsActive && $store.searchQuery.length)}
    aria-haspopup="listbox"
    aria-owns="telemetry-search-results"
  >
      <div class=icon-container>
      {#if $telemetrySearch.loaded}
      <div class=icon in:fly={{ y: -10, duration: 100 }}>
        <SearchIcon  />
      </div>
      {:else}
        <div class=icon transition:fly={{ y: -10, duration: 100 }}>
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
      value={$store.searchQuery} on:input={(evt) => {
          store.setField('searchQuery', evt.target.value);
          store.setField('searchIsActive', true);
      }} />
    </div>
</div>

<TelemetrySearchResults parentElement={searchContainer} />
