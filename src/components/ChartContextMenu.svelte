<script>
  import { timeFormat } from 'd3-time-format';
  import { store, showContextMenu } from '../state/store';

  export let data;
  export let x;
  export let y;
  export let clickedRef;
  export let clickedHov;
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
    store.setField('ref', clickedRef);
    store.setField('hov', clickedHov);
    store.setField('timeHorizon', 'ZOOM');
  }

  function getDateFromPoint(p) {
    let label;
    if (p) {
      const found = data.find((d) => d.build_id === p);
      if (found) {
        label = found.label;
      }
    } else {
      label = data[data.length - 1].label;
    }
    return timeFormat('%Y-%m-%d %H:%M:%S')(label);
  }
</script>

<style>
  div#menu {
    position: absolute;
    display: grid;
    background-color: white;
    width: 300px;
    border: 2px solid #e5e7eb;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border-radius: 0.375rem;
  }
  div.range {
    padding: 5px 15px;
    grid-gap: 5px;
    display: flex;
    flex-direction: row;
  }
  div.key {
    width: 25%;
    font-weight: bold;
  }
  div.value {
    width: 75%;
  }
  div.option {
    padding: 5px 15px;
    grid-gap: 5px;
  }
  div.link:hover {
    background-color: #e5e7eb;
  }
  div.link a {
    display: block;
    cursor: pointer;
    text-decoration: none;
  }
</style>

<svelte:body on:click={onClickOutside} on:keydown|stopPropagation={onEscape} />

{#if $showContextMenu}
  <div
    id="menu"
    style="top: {y + window.scrollY}px; left: {x + window.scrollX}px;"
    on:click={closeMenu}
    bind:this={elem}>
    <div class="range">
      <div class="key">Range:</div>
      <div class="value">
        {getDateFromPoint(clickedHov)}
      </div>
    </div>
    <div class="range">
      <div class="key">to:</div>
      <div class="value">
        {getDateFromPoint(clickedRef)}
      </div>
    </div>
    <div class="option link">
      <a href={zoomUrl} on:click|preventDefault={engageZoom}> Zoom to Range </a>
    </div>
    <div class="option">
      <i>Coming soon:</i><br />
      Pushlog link for selected range
    </div>
  </div>
{/if}
