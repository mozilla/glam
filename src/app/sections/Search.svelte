<script>
  import { tick, setContext } from 'svelte';
import { fly } from 'svelte/transition';
import {
    store,
} from '../state/store';

import {
    setSearchIsActive, setSearchQuery, setProbe,
} from '../state/actions';

import telemetrySearch from '../state/telemetry-search';

import TelemetrySearchResults from './TelemetrySearchResults.svelte';
import SearchIcon from '../../components/icons/Search.svelte';

setContext('setProbe', store.connect(setProbe));
setContext('setSearchIsActive', store.connect(setSearchIsActive));

let inputElement;
let searchContainer;

function turnOnSearch() {
    store.dispatch(setSearchIsActive(true));
}

function turnOffSearch() {
    setTimeout(() => {
      store.dispatch(setSearchIsActive(false));
    }, 100);
}

function unfocus() {
    inputElement.blur();
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
  }

  .inner-container {
    max-width: var(--width);
    height: calc(var(--space-base) * 4);
    box-shadow: var(--depth-medium);
    display: grid;
    grid-template-columns: [icon] 40px [input] auto;
    /* padding-left: var(--space-base); */
    align-items: stretch;
    background-color: var(--input-background-color);
    /* background-color: white; */
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
    /* margin-left: calc(-48px - var(--space-base));
    padding-left: 48px;
    padding-right: 48px; */
    /* color: var(--cool-gray-500); */
    color: var(--input-blur);
    border-radius: var(--space-1h);

    /* background-color: white; */
  }

  input:focus {
    color: var(--input-focus);
    border: 2px solid var(--input-focus-border-color);
    transition: border 200ms;
  }
</style>

<svelte:window on:keydown={onKeypress} />

<div class=search-container>
  <div class=inner-container bind:this={searchContainer}>
      <div class=icon-container>
      {#if $telemetrySearch.loaded}
      <div class=icon in:fly={{ y: -10, duration: 100 }}>
        <SearchIcon  />
      </div>
      {:else}
        <div class=icon out:fly={{ y: -10, duration: 100 }}>
          uh..
        </div>
      {/if}
    </div>
    <input on:focus={turnOnSearch}
      bind:this={inputElement}
      placeholder="search for a telemetry probe"
      on:blur={turnOffSearch}
      value={$store.searchQuery} on:input={(evt) => {
          store.dispatch(setSearchQuery(evt.target.value));
      }} />
    </div>
</div>

<TelemetrySearchResults parentElement={searchContainer} />
