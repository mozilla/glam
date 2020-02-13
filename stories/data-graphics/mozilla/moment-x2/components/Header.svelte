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
  font-size: var(--text-08);
}

nav {
  font-family: var(--main-text-font);
  align-self: center;
  font-size: var(--text-03);
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
  color: var(--toolbar-text-color);
  position: relative;
  text-decoration: none;
  transition: color .4s;
}

a::after {
  border-radius: 1em;
  position: absolute;
  border-top: 2px solid var(--toolbar-text-color);
  opacity: .5;
  content: "";
  left: 0;
  right: 100%;
  bottom: -.14em;
  transition: right .4s cubic-bezier(0,.5,0,1), opacity .8s, border-color .4s;
}

a::before {
  border-radius: 1em;
  position: absolute;
  border-bottom: 2px solid var(--toolbar-text-color);
  opacity: .5;
  content: "";
  left: 100%;
  right: 0;
  top: -.14em;
  transition: right .4s cubic-bezier(0,.5,0,1), left .4s cubic-bezier(0,.5,0,1),  opacity .8s, border-color .4s;
}

a:hover::before {
  left: 50%;
  opacity: 1;
}

a.selected::before {
  left: 0;
  opacity: 1;
  border-color: var(--digital-blue-500);

}

a:hover::after {
  right: 50%;
  opacity: 1;
}

a.selected {
  color: var(--digital-blue-500);
}

a.selected::after {
  right: 0;
  opacity: 1;
  border-color: var(--digital-blue-500);
}

a:hover {
  text-decoration: none;
}

/* .selected {
  border-bottom: 1px solid var(--toolbar-text-color);
} */

.header-content {
  width: 1200px; 
  margin: auto; 
  display: grid; 
  grid-auto-flow: column;
}

.header-content h1 {
  font-family: var(--main-text-font);
}

</style>

<Toolbar backgroundColor={'transparent'} textColor=var(--cool-gray-600)>
  <div class=header-content>
  {#if mounted}
  <h1 in:fly={{ duration: 1000, y: -10 }}>
      <FenixLogo size={48} />
    <span style='color: var(--cool-gray-800); font-weight: 900;'>Incline</span>  <span style="font-weight: 300; color: var(--cool-gray-600)">Launch Metrics</span>
  </h1>
  {/if}

  <nav>
    {#if mounted}
    <ul in:fly={{ duration: 1000, y: -10, delay: 250 }}>
      <li><a class:selected={segment === 'EXECUTIVE'} href='#' on:click={() => { segment = 'EXECUTIVE'; }}>Executive</a></li>
      <li><a class:selected={segment === 'PRODUCT'} href='#'  on:click={() => { segment = 'PRODUCT'; }}>User Behavior</a></li>
      <li><a class:selected={segment === 'MARKETING'} href='#'  on:click={() => { segment = 'MARKETING'; }}>Acquisition</a></li>
    </ul>
    {/if}
  </nav>
  </div>
</Toolbar>