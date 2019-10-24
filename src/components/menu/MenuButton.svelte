<script>
  import { createEventDispatcher } from 'svelte';
import Button from '../Button.svelte';
import FloatingMenu from './FloatingMenu.svelte';

const dispatch = createEventDispatcher();

export let active = false;

function onParentSelect(kvPair) {
    active = false;
    console.log(kvPair);
    dispatch('selection', kvPair);
}

function toggle() { active = !active; }
let button;
$: if (button) console.log(button.getBoundingClientRect());
</script>

<style>
.menu-button {
  outline: 1px solid black;
  width: max-content;
}
</style>

<div class=menu-button bind:this={button}>
<Button on:click={toggle}>
  <slot name='label'></slot>
</Button>
</div>
{#if active}
  <FloatingMenu parent={button} onParentSelect={onParentSelect}>
    <slot name='menu'></slot>
  </FloatingMenu>
{/if}