<script>
  import { CaretDown } from '@graph-paper/icons';
  import { FloatingMenu, MenuList, MenuListItem } from '@graph-paper/menu';

  // export let aggregationTypes;
  export let currentView;
  export let active;

  let button;
  let width;

  function toggle() {
    active = !active;
  }

  function setValue(event) {
    currentView = event.detail.key;
    active = false;
  }

  export let viewInfo = {
    explorer: {
      name: 'Explorer',
      description: 'Observe trends over time and compare two probes.',
    },
    table: {
      name: 'Table',
      description:
        'Get a table of percentile / proportion values over many builds.',
    },
  };
</script>

<style>
  div {
    width: max-content;
  }

  .activating-button {
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-size: var(--text-02);
    margin: 0;
    text-align: left;
    min-width: var(--space-16x);
    background-color: white;
    display: grid;
    grid-template-columns: auto max-content;
    color: var(--subhead-gray-02);

    border-radius: var(--space-1h);
  }
  .menu-list-item__title {
    font-size: var(--text-02);
  }

  .menu-list-item__description {
    width: var(--space-24x);
    font-size: var(--text-015);
    color: var(--subhead-gray-01);
  }

  .active {
    background-color: rgba(0, 0, 0, 0.2);
    color: var(--subhead-gray-02);
  }
</style>

<div class="menu-button" bind:this={button}>
  <button class="activating-button" on:click={toggle} class:active>
    <div>{viewInfo[currentView].name}</div>
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
      {#each Object.entries(viewInfo) as [k, v], i}
        <MenuListItem key={k} value={k}>
          <div class="menu-list-item__title">{v.name}</div>
          <div class="menu-list-item__description">{v.description}</div>
        </MenuListItem>
      {/each}
    </MenuList>
  </FloatingMenu>
{/if}
