<script>
  import { createEventDispatcher } from 'svelte';
  import { FloatingMenu } from '@graph-paper/menu';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';

  const dispatch = createEventDispatcher();

  export let active = false;
  export let location = 'bottom';
  export let variant;
  export let size;
  export let alignment = 'left';
  export let offset = 0;
  export let tooltip;

  let width;

  function onParentSelect(kvPair) {
    active = false;
    dispatch('selection', kvPair);
  }

  function toggle() {
    active = !active;
  }
  let button;
</script>

<style>
  .menu-button {
    width: max-content;
  }

  .menu-button.large {
    display: grid;
    align-items: stretch;
  }

  .activating-button {
    margin: 0;
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    border-radius: var(--space-1h);
    font-size: calc(var(--space-base) * 1.5);
    border: none;
    border: 1px solid var(--cool-gray-200);
    color: var(--digital-blue-700);
    background-color: var(--cool-gray-subtle);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.05);
    transition: 100ms;
    cursor: pointer;
  }

  .activating-button:hover {
    background-color: var(--cool-gray-150);
    color: var(--digital-blue-900);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
  }
  .activating-button.dark {
    background-color: transparent;
    border: 2px solid transparent;
    color: var(--digital-blue-200);
  }

  .activating-button.dark:hover {
    background-color: var(--blue-slate-600);
    color: var(--digital-blue-300);
    box-shadow: 0px 2px 0px rgba(255, 255, 255, 0.1);
  }

  .activating-button.large {
    font-size: var(--text-03);
    border-radius: 0px;
    border-top: none;
    border-bottom: none;
    align-self: stretch;
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
  }
</style>

<div class="menu-button  {size || ''}" bind:this={button}>
  <button
    use:tooltipAction={{ text: !active ? tooltip : undefined }}
    class="activating-button {variant || ''} {size || ''}"
    on:click={toggle}
  >
    <slot name="label" />
  </button>
</div>
{#if active}
  <FloatingMenu
    bind:width
    {offset}
    on:cancel={() => {
      active = false;
    }}
    {location}
    {alignment}
    parent={button}
    {onParentSelect}
  >
    <slot name="menu" />
  </FloatingMenu>
{/if}
