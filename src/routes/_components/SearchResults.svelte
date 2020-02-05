<script>
import { format } from 'd3-format';
import { fly } from 'svelte/transition';
import { afterUpdate } from 'svelte';

import Portal from 'udgl/Portal.svelte';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';

import {
  searchResults, store,
} from '../../state/store';


// FIXME: Unless we generalize the search results in some way, I'm not sure
// these shouldn't just be imported directly into this component.
export let parentElement;

// when search query changes for any reason, always center back to first item,
// even if the result set is the exact same (for now, potential FIXME)

let windowWidth;
let searchListElement;
let formatTotal = format(',.4d');
let focusedItem = 0;
let focusedElement;

$: if ($store.searchQuery) { focusedItem = 0; }

$: if (searchListElement) {
  focusedElement = searchListElement.querySelector(`li:nth-child(${focusedItem + 1})`);
}

const keyUp = () => {
  if (!focusedItem) focusedItem = 0;
  if (focusedItem > 0) {
    focusedItem -= 1;
  }
};

const keyDown = () => {
  if (!focusedItem) focusedItem = 0;
  if (focusedItem < $searchResults.results.length - 1) {
    focusedItem += 1;
  }
};

const handleKeypress = (event) => {
  const { key } = event;
  if ($searchResults.results && $store.searchIsActive && $searchResults.results.length >= 1) {
    if (key === 'ArrowUp') keyUp(event.target);
    if (key === 'ArrowDown') keyDown(event.target);
    if (key === 'Enter') {
      store.setProbe($searchResults.results[focusedItem].name);
      store.setField('searchIsActive', false);
      // reset focused element
      focusedItem = 0;
    }
    if (key === 'Escape') {
      store.setField('searchIsActive', true);
      // reset focused element
      focusedItem = 0;
    }
    if (key === 'Home') {
      focusedItem = 0;
    }
    if (key === 'End') {
      focusedItem = $searchResults.results.length - 1;
    }
  }
};

afterUpdate(() => {
  if (focusedElement) {
    focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});

let x;
let y;
let width;

// update the location once parentElement is defined (that is, the parentElement's component mounts)
$: if (parentElement && windowWidth) {
  const bounds = parentElement.getBoundingClientRect();
  y = bounds.top + bounds.height;
  x = bounds.left;
  width = bounds.width;
}

</script>

<style>

/* FIXME: move toward BEM */
.telemetry-results {
  --header-bg-color: var(--cool-gray-200);
  --list-border-color: gainsboro;
  --list-border: 1px solid var(--list-border-color);
  max-height: calc(100vh - var(--header-height) * 3);
  border: 1px solid var(--cool-gray-250);
  background-color: white;
  max-width: calc(var(--increment) * 16);
  box-shadow: var(--depth-5l);
  border-bottom-right-radius: var(--border-radius-base);
  border-bottom-left-radius: var(--border-radius-base);
  position: fixed;
  left: 0;
  top: var(--increment);
  overflow: hidden;
  z-index: 2000;
}

.header-container {
  background-color: var(--cool-gray-250);
  --height: calc(var(--space-base) * 3 + var(--space-base) * 2);
  font-size:.8em;
  color: var(--body-gray-01);
  font-style: italic;
  height: var(--height);
  max-height: var(--height);
  display: grid;
  align-items: stretch;
}

.header {
  padding:var(--space-base);
  padding-left: var(--space-2x);
  padding-right: var(--space-2x);
  display: grid;
  grid-template-columns: max-content auto;
  align-items:center;
  grid-column-gap: var(--space-base);
  position:relative;
}

.header--loaded {
  grid-template-columns: auto;
  grid-column-gap: 0px;
  align-items:center;
}

ul {
  max-height: calc(100vh - var(--header-height) * 3 - 40px);
  padding:0;
  margin:0;
  list-style-type: none;
  overflow-y: scroll;
}

li:first-child {
  border-top: var(--list-border);
}

li {
  padding:var(--space-2x);
  border-bottom: var(--list-border);
  display:grid;
  grid-template-columns: auto 100px;
  grid-column-gap: var(--space-2x);
  grid-template-rows: max-content max-content;
  grid-template-areas: "title probe-type"
                        "description versions";
  cursor: pointer;
  color: var(--body-gray-01);
}

.name {
  grid-area: title;
  word-break: break-all;
  font-weight:bold;
}

.probe-type, .first-release {
  justify-self: end;
  padding: var(--border-radius-1h);
}

.first-release {
  font-size:.8em;
  text-align: right;
  align-self: end;
}

.probe-type {
  grid-area: probe-type;
}

.description {
  grid-area: description;
  font-size:.8em;
  line-height:1.4;
  outline: 1px;
  max-height: 2.6em;
  overflow: hidden;
  color: var(--subhead-gray-02);
  font-style: italic;
  padding-bottom: var(--space-1h);
}

.focused {
    background-color: var(--bg-gray-01);
}

</style>

<svelte:window bind:innerWidth={windowWidth} on:keydown={handleKeypress} />

<Portal>
{#if $store.searchIsActive && $store.searchQuery.length}
  <div 
  id="telemetry-search-results"
  style="left: calc({x}px + var(--space-base)); width: calc({width}px - var(--space-base));"
    transition:fly={{ duration: 20, y: -10 }}
    class="telemetry-results">
      <div class="header-container">
          {#if $searchResults.total}
          <div class="header header--loaded" in:fly={{ x: -5, duration: 200 }}>
              <div>found {$searchResults.results.length} of
                  {formatTotal($searchResults.total)} probes
              </div>
          </div>
          {:else}
          <div class="header" out:fly={{ x: 5, duration: 200 }}>
              <LineSegSpinner color={'var(--subhead-gray-02)'} />
              <div>
                  getting the probes – one second!
              </div>
          </div>
          {/if}
          
      </div>
      {#if $searchResults.results.length}
          <ul bind:this={searchListElement}
            aria-label="probe search results"
            activedescendent={$searchResults.results[focusedItem].name}>
          {#each $searchResults.results as {id, name, type, description, versions}, i (id)}
              <li 
                  role="option"
                  id={name}
                  class:focused={focusedItem === i} on:click={() => {
                    store.setProbe($searchResults.results[focusedItem].name);
              }}
                  on:mouseover={() => { focusedItem = i; }}>
                  <div class="name body-text--short-01">{name}</div>
                  <div class="probe-type label label-text--01 label--{type}">{type}</div>
                  <div class="description body-text--short-01">{@html description}</div>
              </li>
          {/each}
          </ul>
      {/if}
  </div>
{/if}
</Portal>
