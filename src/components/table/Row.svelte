<script>
import { setContext } from 'svelte';

export let header = false;

setContext('header', header);
let hovered = false;
function setHover(tf) {
  hovered = tf;
}
</script>

<tr on:mouseover={() => setHover(true)} on:mouseleave={() => setHover(false)}>
  <slot hovered={hovered}></slot>
</tr>