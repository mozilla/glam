<script>
  // Menu.svelte – handles the placement of menus when necessary.
  // get the parent element location;
  // set the position of this element based off the parent element.
  // include offset.
import { setContext, onMount } from 'svelte';

import Portal from '../Portal.svelte';

export let active = false;
export let parent;
export let offset = 0;
export let onSelect = () => {};

let element;

let elementWidth = 0;
let parentRight;
let parentBottom;

setContext('onChildSelect', onSelect);

function placeMenu() {
    const parentPosition = parent.getBoundingClientRect();
    const elementPosition = element.getBoundingClientRect();
    // leftMarginOffset = +getComputedStyle(parent).marginLeft.slice(0, -2);
    elementWidth = elementPosition.width;
    parentRight = parentPosition.right;
    parentBottom = parentPosition.bottom;
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
</style>

<Portal>
  <div class=bound-menu bind:this={element} style="
    left: {parentRight - elementWidth}px;
    top: {parentBottom + offset}px;
    ">
    <slot></slot>
  </div>
</Portal>