<script>
  // Menu.svelte – handles the placement of menus when necessary.
  // get the parent element location;
  // set the position of this element based off the parent element.
  // include offset.
import { setContext, onMount, createEventDispatcher } from 'svelte';

import Portal from '../Portal.svelte';

export let active = false;
export let parent;
export let offset = 0;
export let position = 'bottom-left';
export let width;
export let onParentSelect = () => {};

let element;

let elementWidth = 0;
let elementHeight = 0;
let parentRight;
let parentBottom;
let parentLeft;
let parentTop;

let left;
let top;

setContext('onChildSelect', onParentSelect);

const dispatch = createEventDispatcher();

function handleKeypress(event) {
    const { key } = event;
    if (key === 'Escape') {
      dispatch('cancel');
    }
}

function placeMenu() {
    const parentPosition = parent.getBoundingClientRect();
    const elementPosition = element.getBoundingClientRect();
  
    // leftMarginOffset = +getComputedStyle(parent).marginLeft.slice(0, -2);
    elementWidth = elementPosition.width;
    elementHeight = elementPosition.height;

    parentRight = parentPosition.right;
    parentLeft = parentPosition.left;
    parentTop = parentPosition.top;
    parentBottom = parentPosition.bottom;

    width = elementWidth;
    if (position.startsWith('bottom')) {
      top = parentBottom + offset;
    } else if (position.startsWith('top')) {
      top = parentTop - elementHeight - offset;
    } else {
      // FIXME: is this the right default?
      top = parentBottom + offset;
    }
    if (position.endsWith('left')) {
      left = parentLeft;
    } else if (position.endsWith('right')) {
      left = parentRight - elementWidth;
    } else {
      // FIXME: is this the right default?
      left = parentLeft;
    }
  }

$: if (parent && element) {
    placeMenu();
}

</script>

<style>
.bound-menu {
  position: absolute;
  width: max-content;
}

.click-area {
  position:absolute;
  left:0;
  top:0;
  width: 100vw;
  height:100vh;
}
</style>

<svelte:window on:keydown={handleKeypress} />


<Portal>
  <div on:click={() => { dispatch('cancel'); }} class=click-area></div>
  <div class=bound-menu bind:this={element} style="
    left: {left}px;
    top: {top}px;
    ">
    <slot></slot>
  </div>
</Portal>