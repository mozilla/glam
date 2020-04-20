<script>
  import { createEventDispatcher } from 'svelte';
import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import FloatingMenu from 'udgl/menu/FloatingMenu.svelte';

const dispatch = createEventDispatcher();

export let active = false;
export let location = 'bottom';
export let alignment = 'left';
export let offset = 0;
export let tooltip;

let width;

function onParentSelect(kvPair) {
    active = false;
    dispatch('selection', kvPair);
}

function toggle() { active = !active; }
let button;

</script>

<style>
.menu-button {
  width: max-content;
}

.activating-button {
  margin:0;
  padding: var(--space-1h);
  padding-left: var(--space-base);
  padding-right: var(--space-base);
  border-radius: var(--space-1h);
  font-size: calc(var(--space-base) * 1.5);
  border: none;
  border: 1px solid var(--cool-gray-200);
  color: var(--digital-blue-700);
  background-color: var(--cool-gray-subtle);
  box-shadow: 0px 2px 2px rgba(0,0,0,.05);
  transition: 100ms;
  cursor: pointer;
}

.activating-button:hover {
  background-color: var(--cool-gray-150);
  color: var(--digital-blue-900);
  box-shadow: 0px 2px 2px rgba(0,0,0,.1);
}

</style>

<div class=menu-button bind:this={button}>
<button use:tooltipAction={{ text: tooltip }} class=activating-button on:click={toggle}>
    <slot name='label'></slot>
</button>
</div>
{#if active}
  <FloatingMenu bind:width={width} offset={offset} on:cancel={() => { active = false; }} location={location} alignment={alignment} parent={button} onParentSelect={onParentSelect}>
    <slot name='menu'></slot>
  </FloatingMenu>
{/if}
