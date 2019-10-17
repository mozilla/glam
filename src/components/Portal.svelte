<script>
import { onMount, onDestroy } from 'svelte';

let ref;
let portal;

onMount(() => {
  portal = document.createElement('div');
  portal.className = 'portal';
  document.body.appendChild(portal);
  portal.appendChild(ref);
});

onDestroy(() => {
  document.body.removeChild(portal);
});

</script>

<style>
    .portal-container { display: none; }

  </style>

<div class="portal-container">
  <div bind:this={ref}>
    <slot></slot>
  </div>
</div>