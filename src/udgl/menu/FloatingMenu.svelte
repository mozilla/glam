<script>
  // Menu.svelte – handles the placement of menus when necessary.
  // get the parent element location;
  // set the position of this element based off the parent element.
  // include offset.
  import { setContext, createEventDispatcher } from 'svelte';
  import { placeElement } from '../utils/float-placement';

  import Portal from '../Portal.svelte';

  export let active = false;
  export let parent;
  export let offset = 0;
  export let width;
  export let location = 'bottom';
  export let alignment = 'left';
  let scrollY;
  export let onParentSelect = () => {};

  let element;

  let innerWidth;
  let innerHeight;

  let leftPlacement;
  let topPlacement;

  setContext('onChildSelect', onParentSelect);

  const dispatch = createEventDispatcher();

  function handleKeypress(event) {
    const { key } = event;
    if (key === 'Escape') {
      dispatch('cancel');
    }
  }

  $: if (element && parent) {
    [leftPlacement, topPlacement] = placeElement({
      location,
      alignment,
      elementPosition: element.getBoundingClientRect(),
      parentPosition: parent.getBoundingClientRect(),
      distance: offset,
      y: scrollY,
    });
  }
</script>

<style>
  .bound-menu {
    position: absolute;
    width: max-content;
    z-index: 10;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .click-area {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }
</style>

<svelte:window
  bind:innerWidth
  bind:innerHeight
  on:keydown={handleKeypress}
  bind:scrollY />

<Portal>
  <div
    on:click={() => {
      dispatch('cancel');
    }}
    class="click-area" />
  <div
    class="bound-menu"
    bind:this={element}
    style=" left: {leftPlacement}px; top: {topPlacement}px; max-height:
    calc(100vh - {topPlacement}px - var(--screen-padding)); ">
    <slot />
  </div>
</Portal>
