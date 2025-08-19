<script>
  import { CaretDown } from '@graph-paper/icons';
  import { FloatingMenu, MenuList, MenuListItem } from '@graph-paper/menu';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import { createEventDispatcher } from 'svelte';

  import { store } from '../../state/store';

  const dispatch = createEventDispatcher();

  export let options;
  export let currentKey;
  export let active;
  export let tooltipText = 'this probe has multiple keys associated with it';
  export let fieldName = 'metricKey';
  export let disableStoreUpdate = false;

  let button;
  let width;

  options.sort();

  function toggle() {
    active = !active;
  }

  function setValue(event) {
    const selectedKey = event.detail.key;
    currentKey = selectedKey;

    // Dispatch selection event to parent
    dispatch('selection', { key: selectedKey });
    if (!disableStoreUpdate) {
      store.setField(fieldName, selectedKey);
    }

    active = false;
  }
</script>

<style>
  .activating-button {
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-size: var(--text-01);
    margin: 0;
    text-align: left;
    /* min-width: var(--space-16x); */
    background-color: white;
    border: 1px solid var(--cool-gray-300);
    display: grid;
    grid-auto-flow: column;
    width: max-content;
    grid-column-gap: var(--space-base);
    color: var(--subhead-gray-02);
    border-radius: var(--space-1h);
    cursor: pointer;
  }

  .activating-button:hover {
    border-color: var(--cool-gray-400);
    background-color: var(--cool-gray-50);
  }
  .menu-list-item__title {
    font-size: var(--text-01);
  }

  .active {
    background-color: rgba(0, 0, 0, 0.2);
    color: var(--subhead-gray-02);
  }
</style>

<div
  class="menu-button"
  bind:this={button}
  style="position: relative; overflow: visible;"
>
  <button
    class="activating-button"
    on:click={toggle}
    class:active
    use:tooltipAction={{
      text: tooltipText,
    }}
  >
    <div>
      {#if currentKey && options.includes(currentKey)}
        {currentKey}
      {:else}
        <span style="color: var(--cool-gray-400); font-style: italic;">
          Select an option...
        </span>
      {/if}
    </div>
    <CaretDown size="16" />
  </button>
</div>

{#if active}
  <FloatingMenu
    bind:width
    offset={1}
    on:cancel={() => {
      active = false;
    }}
    parent={button}
  >
    <MenuList on:selection={setValue}>
      {#each options as key, i}
        <MenuListItem {key} value={key}>
          <div class="menu-list-item__title">{key}</div>
        </MenuListItem>
      {/each}
    </MenuList>
  </FloatingMenu>
{/if}
