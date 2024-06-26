<script>
  import page from 'page';
  import { fly } from 'svelte/transition';
  import { afterUpdate } from 'svelte';
  import { Portal } from '@graph-paper/portal';
  import LineSegSpinner from '../LineSegSpinner.svelte';
  import { currentQuery, store } from '../../state/store';
  import Markdown from '../Markdown.svelte';

  export let results = [];

  // FIXME: Unless we generalize the search results in some way, I'm not sure
  // these shouldn't just be imported directly into this component.
  export let parentElement;
  export let query = '';
  export let searchIsActive;

  // when search query changes for any reason, always center back to first item,
  // even if the result set is the exact same (for now, potential FIXME)

  let windowWidth;
  let searchListElement;
  let focusedItem = 0;
  let focusedElement;

  $: if (query) {
    focusedItem = 0;
  }

  $: if (searchListElement) {
    focusedElement = searchListElement.querySelector(
      `li:nth-child(${focusedItem + 1})`
    );
  }

  const keyUp = () => {
    if (!focusedItem) focusedItem = 0;
    if (focusedItem > 0) {
      focusedItem -= 1;
    }
  };

  const keyDown = () => {
    if (!focusedItem) focusedItem = 0;
    if (focusedItem < results.length - 1) {
      focusedItem += 1;
    }
  };

  const getProductDimensions = (result) => {
    if (result.glean) {
      // we have to manually set the product dimensions for FOG and Fenix to avoid them automatically picking up the Firefox legacy dimensions
      store.setField('product', 'fog');
      store.setField('productDimensions', {
        app_id: 'nightly',
        os: '*',
        ping_type: '*',
        aggregationLevel: 'build_id',
      });
      return 'fog';
    }
    if ($store.searchProduct === 'fenix') {
      store.setField('product', 'fenix');
      store.setField('productDimensions', {
        app_id: 'nightly',
        os: 'Android',
        ping_type: 'metrics',
        aggregationLevel: 'build_id',
      });
      return 'fenix';
    }
    if ($store.searchProduct === 'firefox' && !result.glean) {
      store.setField('product', 'firefox');
      return 'firefox';
    }
    return undefined;
  };

  const handleKeypress = (event) => {
    const { key } = event;
    if (results && searchIsActive && results.length >= 1) {
      if (key === 'ArrowUp') keyUp(event.target);
      if (key === 'ArrowDown') keyDown(event.target);
      if (key === 'Enter') {
        searchIsActive = false;

        page.show(
          `/${getProductDimensions(results[focusedItem])}/probe/${results[
            focusedItem
          ].name
            .toLowerCase()
            .replaceAll('.', '_')}/explore${$currentQuery}`
        );
        focusedItem = 0; // reset focused element
      }
      if (key === 'Escape') {
        searchIsActive = true;
        // reset focused element
        focusedItem = 0;
      }
      if (key === 'Home') {
        focusedItem = 0;
      }
      if (key === 'End') {
        focusedItem = results.length - 1;
      }
    }
  };

  afterUpdate(() => {
    if (focusedElement) {
      focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  let x;
  let width;

  // update the location once parentElement is defined (that is, the parentElement's component mounts)
  $: if (parentElement && windowWidth) {
    const bounds = parentElement.getBoundingClientRect();
    x = bounds.left;
    width = bounds.width;
  }

  const onClick = () => {
    // clearing the ref field to avoid the probe explorer
    // from trying to load a probe from the URL

    store.setField('ref', '');

    page.show(
      `/${getProductDimensions(results[focusedItem])}/probe/${results[
        focusedItem
      ].name
        .toLowerCase()
        .replaceAll('.', '_')}/explore${$currentQuery}`
    );
  };
</script>

<style>
  /* FIXME: move toward BEM */
  .telemetry-results {
    --header-bg-color: white;
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
    background-color: var(--cool-gray-100);
    --height: calc(var(--space-base) * 3 + var(--space-base) * 2);
    font-size: 0.8em;
    color: var(--body-gray-01);
    font-style: italic;
    height: var(--height);
    max-height: var(--height);
    display: grid;
    align-items: stretch;
  }

  .header {
    padding: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    display: grid;
    grid-template-columns: max-content auto;
    align-items: center;
    grid-column-gap: var(--space-base);
    position: relative;
  }

  .glean {
    color: var(--pantone-red-600);
    font-weight: 300;
    font-size: 0.9em;
  }

  .header--loaded {
    grid-template-columns: auto;
    grid-column-gap: 0px;
    align-items: center;
  }

  ul {
    max-height: calc(100vh - var(--header-height) * 3 - 40px);
    padding: 0;
    margin: 0;
    list-style-type: none;
    overflow-y: scroll;
  }

  li:first-child {
    border-top: var(--list-border);
  }

  li {
    padding: var(--space-2x);
    border-bottom: var(--list-border);
    display: grid;
    grid-template-columns: auto 100px;
    grid-column-gap: var(--space-2x);
    grid-template-rows: max-content max-content;
    grid-template-areas:
      'title probe-type'
      'description versions';
    cursor: pointer;
    color: var(--body-gray-01);
  }

  .name {
    grid-area: title;
    word-break: break-all;
    font-weight: bold;
  }

  .probe-type,
  .first-release {
    justify-self: end;
    padding: var(--border-radius-1h);
  }

  .first-release {
    font-size: 0.8em;
    text-align: right;
    align-self: end;
  }

  .probe-type {
    grid-area: probe-type;
    white-space: nowrap;
  }

  .description {
    grid-area: description;
    font-size: 0.8em;
    line-height: 1.4;
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
  {#if searchIsActive && query.length}
    <div
      id="telemetry-search-results"
      style="left: {x}px; width: {width}px;"
      transition:fly={{ duration: 20, y: -10 }}
      class="telemetry-results"
    >
      <div class="header-container">
        <div class="header" in:fly={{ x: -5, duration: 200 }}>
          {#if results.length}
            <div>found {results.length} probes</div>
          {:else if results.length === 0}
            <div>your search produced 0 results</div>
          {:else if results.status}
            <!-- FIXME: This should be pretty. -->
            <div>
              hmm ... having trouble reaching the search service ({results.status}).
            </div>
          {:else}
            <div>
              <LineSegSpinner color={'var(--subhead-gray-02)'} />
              fetching probes...
            </div>
          {/if}
        </div>
      </div>

      {#if results.length}
        <ul
          bind:this={searchListElement}
          aria-label="probe search results"
          activedescendent={results[focusedItem].name}
        >
          {#each results as searchResult, i (searchResult.name)}
            <li
              role="option"
              id={searchResult.name}
              class:focused={focusedItem === i}
              on:click={onClick}
              on:mouseover={() => {
                focusedItem = i;
              }}
            >
              <div class="name body-text--short-01">
                {searchResult.name}
                {#if searchResult.glean}<span class="glean">(GLEAN)</span>
                {/if}
              </div>
              {#if searchResult.active === false}
                <div class="probe-type label label-text--01 label--inactive">
                  inactive
                </div>
              {:else}
                <div
                  class="probe-type label label-text--01 label--{searchResult.type}"
                >
                  {searchResult.type.replace('_', ' ')}
                </div>
              {/if}
              <div class="description body-text--short-01">
                <Markdown text={searchResult.description} />
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</Portal>
