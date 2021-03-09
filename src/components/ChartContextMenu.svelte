<script>
  import { store, showContextMenu } from '../state/store';

  export let x;
  export let y;
  export let zoomUrl;

  let elem;

  function onClickOutside(e) {
    if (elem && !elem.contains(e.target)) {
      $showContextMenu = false;
    }
  }

  function onEscape(e) {
    if (e.key === 'Escape' && $showContextMenu) {
      $showContextMenu = false;
    }
  }

  function closeMenu() {
    $showContextMenu = false;
  }

  function engageZoom() {
    store.setField('timeHorizon', 'ZOOM');
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
  div.option:hover a {
    /* background-color: #e5e7eb; */
    cursor: pointer;
  }
</style>

<svelte:body on:click={onClickOutside} on:keydown|stopPropagation={onEscape} />

{#if $showContextMenu}
  <div
    id="menu"
    style="top: {y}px; left: {x}px;"
    on:click={closeMenu}
    bind:this={elem}>
    <div class="option">
      <strong>Hov: </strong>
      {$store.hov}
    </div>
    <div class="option">
      <a href={zoomUrl} on:click|preventDefault={engageZoom}>
        Zoom from here to the <code>REF</code> point
      </a>
    </div>
    <div class="option">
      <i>Coming soon: Pushlog links for selected ranges.</i>
    </div>
  </div>
{/if}
