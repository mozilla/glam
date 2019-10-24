<script>
  import { createEventDispatcher } from 'svelte';
import Button from '../Button.svelte';
import FloatingMenu from './FloatingMenu.svelte';

const dispatch = createEventDispatcher();

export let active = false;
export let position = 'top-left';

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
<Button compact class=button--high on:click={toggle}>
  <slot name='label'></slot>
</Button>
</div>
{#if active}
  <FloatingMenu  on:cancel={() => { active = false; }}  position='bottom-left' parent={button} onParentSelect={onParentSelect}>
    <slot name='menu'></slot>
  </FloatingMenu>
{/if}