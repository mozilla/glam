<script>
  import { showContextMenu } from '../state/store.js';

  export let x;
  export let y;

  let elem;

  function onClickOutside(e) {
    if (elem && !elem.contains(e.target)) {
      $showContextMenu = false;
    }
  }

  function closeMenu() {
    $showContextMenu = false;
  }
</script>

<style>
  div#menu {
    position: absolute;
    display: grid;
    background: white;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 0.375rem;
  }
  div.option {
    padding: 5px 15px;
    grid-gap: 5px;
  }
  div.option:hover {
    background-color: #e5e7eb;
    cursor: pointer;
  }
</style>

<svelte:body on:click={onClickOutside} />

{#if $showContextMenu}
  <div
    id="menu"
    style="top: {y}px; left: {x}px;"
    on:click={closeMenu}
    bind:this={elem}>
    <div class="option">
      Zoom from here to the <code>REF</code> point
    </div>
  </div>
{/if}
