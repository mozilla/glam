<script>
  import { createEventDispatcher } from 'svelte';
import Button from '../Button.svelte';
import FloatingMenu from './FloatingMenu.svelte';

const dispatch = createEventDispatcher();

export let active = false;
export let position = 'top-left';
export let offset = 0;
export let level = 'high';
export let compact = false;

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

</style>

<div class=menu-button bind:this={button}>
<Button level={level} compact={compact} on:click={toggle}>
  <slot name='label'></slot>
</Button>
</div>
{#if active}
  <FloatingMenu offset={offset} on:cancel={() => { active = false; }}  position='bottom-left' parent={button} onParentSelect={onParentSelect}>
    <slot name='menu'></slot>
  </FloatingMenu>
{/if}