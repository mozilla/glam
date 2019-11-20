<script>
  import { createEventDispatcher } from "svelte";
  import Button from "../Button.svelte";
  import FloatingMenu from "./FloatingMenu.svelte";

  const dispatch = createEventDispatcher();

  export let active = false;
  export let location = "bottom";
  export let alignment = "left";
  export let offset = 0;
  export let level = "high";
  export let compact = false;

  let width;

  function onParentSelect(kvPair) {
    active = false;
    dispatch("selection", kvPair);
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

  .activating-button {
    margin: 0;
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-size: var(--text-02);
    border: none;
    background-color: hsla(240, 50%, 80%, 0.3);
    color: white;
  }
</style>

<div class="menu-button" bind:this={button}>
  <!-- <Button level={level} compact={compact} on:click={toggle}>
  <slot name='label'></slot>
</Button> -->
  <button class="activating-button" on:click={toggle}>
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
    {onParentSelect}>
    <slot name="menu" />
  </FloatingMenu>
{/if}
