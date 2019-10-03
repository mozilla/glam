<script>
  import { tick } from 'svelte';
import {
    searchQuery,
    updateSearchQuery,
    store,
    updateSearchIsActive,
} from '../store/store';
import SearchIcon from '../../components/icons/Search.svelte';

let inputElement;

function turnOnSearch() {
    store.dispatch(updateSearchIsActive(true));
}

function turnOffSearch() {
    setTimeout(() => {
      store.dispatch(updateSearchIsActive(false));
    }, 50);
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
    height: var(--increment);
    box-shadow: 0px 0px var(--space-1h) rgba(0, 0, 0, 0.2);
    display: grid;
    grid-template-columns: [icon] 40px [input] auto [help] 40px;
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    align-items: stretch;
    background-color: white;
  }

  .icon {
    display: grid;
    align-items: center;
    justify-items: center;
    opacity: 0.5;
  }

  input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    font-size: 1em;
    border: none;
    color: var(--cool-gray-500);
    background-color: white;
  }

  input:focus {
    color: var(--cool-gray-900);
  }
</style>

<svelte:window on:keydown={onKeypress} />

<div class=search-container>
  <div class=icon><SearchIcon /></div>
  <input on:focus={turnOnSearch}
      bind:this={inputElement}
      placeholder="search for a telemetry probe"
      on:blur={turnOffSearch}
      bind:value={$searchQuery} on:input={(evt) => {
          updateSearchQuery(evt.target.value);
      }} />
</div>
