<script>
import { onMount, onDestroy, setContext } from 'svelte';
import { writable } from 'svelte/store';

export let overflowX = false;
export let overflowY = false;
export let width = '100%';
export let height = '100%';

let container;
let scrollLeft = writable(0);
let scrollTop = writable(0);

setContext('scrollLeft', scrollLeft);
setContext('scrollTop', scrollTop);

function updateScroll() {
  scrollLeft.set(container.scrollLeft);
  scrollTop.set(container.scrollTop);
}
onMount(() => {
  container.addEventListener('scroll', updateScroll);
});
onDestroy(() => { container.removeEventListener('scroll', updateScroll); });

</script>

<div
  bind:this={container}
  style="
    overflow-x: {overflowX ? 'auto' : 'visible'};
    overflow-y: {overflowY ? 'auto' : 'visible'};
    width: {width};
    height: {height};
    "
>
  <table class=data-table>
    <slot></slot>
  </table>
</div>
