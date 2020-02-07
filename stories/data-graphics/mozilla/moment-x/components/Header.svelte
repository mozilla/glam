<script>
import { fly } from 'svelte/transition';
import Toolbar from 'udgl/layout/Toolbar.svelte';
import { onMount } from 'svelte';

import FenixLogo from './Fenix.svelte';

export let segment = 'EXECUTIVE';

let mounted = false;
onMount(() => { mounted = true; });

</script>

<style>

h1 {
  padding: var(--space-2x);
  padding-left: var(--space-4x);
  padding-right: var(--space-4x);
  font-size: var(--text-09);
}

nav {
  font-family: var(--main-text-font);
  align-self: center;
  font-size: var(--text-04);
  font-weight: 300;
}

ul {
  margin:0;
  padding:0;
  
  display: grid;
  grid-auto-flow: column;
  list-style-type: none;
  align-items: center;
}

a {
  color: white;
}

.selected {
  border-bottom: 1px solid white;
}

</style>

<Toolbar>
  {#if mounted}
  <h1 in:fly={{ duration: 1000, x: -10 }}>
      <FenixLogo size={60} />
    Moment X Dashboard
  </h1>
  {/if}

  <nav>
    <ul>
      <li><a class:selected={segment === 'EXECUTIVE'} href='#' on:click={() => { segment = 'EXECUTIVE'; }}>Executive</a></li>
      <li><a class:selected={segment === 'PRODUCT'} href='#'  on:click={() => { segment = 'PRODUCT'; }}>Product</a></li>
      <li><a class:selected={segment === 'MARKETING'} href='#'  on:click={() => { segment = 'MARKETING'; }}>Marketing</a></li>
    </ul>
  </nav>

</Toolbar>