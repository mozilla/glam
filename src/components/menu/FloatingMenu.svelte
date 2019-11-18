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
export let width;
export let location = 'bottom';
export let alignment = 'left';
let y;
export let onParentSelect = () => {};

let element;

let elementWidth = 0;
let elementHeight = 0;
let parentRight;
let parentBottom;
let parentLeft;
let parentTop;
let windowWidth;
let windowHeight;


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
    if (!element || !parent) return;
    const parentPosition = parent.getBoundingClientRect();
    const elementPosition = element.getBoundingClientRect();
  
    elementWidth = elementPosition.width;
    elementHeight = elementPosition.height;

    parentRight = parentPosition.right;
    parentLeft = parentPosition.left;
    parentTop = parentPosition.top + y;
    parentBottom = parentPosition.bottom + y;

    width = elementWidth;
  
    if (location === 'bottom') {
      top = parentBottom + offset;
    } else if (location === 'top') {
      top = parentTop - elementHeight - offset;
    } else if (location === 'left') {
      // FIXME: is this the left / right default?
      left = parentLeft - elementWidth - offset;
    } else {
      left = parentRight + offset;
    }
    // FIXME: throw warning when location & alignment don't make sense
    if (alignment === 'right') {
      left = parentRight - elementWidth;
      // set right if off window
      if (left < 0) {
        left = parentLeft;
      }
    } else if (alignment === 'left') {
      // make it alignment="right" if it exceeds windowWith - elementWidth.
      left = parentLeft;
      if (left > windowWidth - elementWidth) {
        left = parentRight - elementWidth;
      }
    } else if (alignment === 'top') {
      top = parentTop;
      // if bottom edge of float is below height
      if (top + elementHeight > windowHeight) {
        top = parentBottom - elementHeight;
      }
    } else {
      top = parentBottom - elementHeight;
      if (top < 0) {
        top = parentTop;
      }
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
  position:fixed;
  left:0;
  top:0;
  width: 100vw;
  height: 100vh;
}
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} on:keydown={handleKeypress} bind:scrollY={y} />


<Portal>
  <div on:click={() => { dispatch('cancel'); }} class=click-area></div>
  <div class=bound-menu bind:this={element} style="
    left: {left}px;
    top: {top}px;
    ">
    <slot></slot>
  </div>
</Portal>