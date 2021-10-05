<script>
  import { timeFormat } from 'd3-time-format';
  import { store, showContextMenu } from '../state/store';
  import GitBranch from './icons/GitBranch.svelte';
  import ZoomIn from './icons/ZoomIn.svelte';
  import Graphs from './icons/Graphs.svelte';

  export let data;
  export let x;
  export let y;
  export let clickedRef;
  export let clickedHov;
  export let zoomUrl;
  export let pushlogUrl;

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
    if (p) {
      const found = data.find((d) => d.build_id === p);
      if (found) {
        return found.label;
      }
    }
    return data[data.length - 1].label;
  }

  const dateFormatter = timeFormat('%Y-%m-%d');
  const timeFormatter = timeFormat('%H:%M:%S');

  let telemetryPath;
  const table =
    $store.productDimensions.channel === 'nightly'
      ? 'main_nightly'
      : 'main_1pct';
  if ($store.probe.type === 'histogram') {
    if (['main', 'parent'].includes($store.productDimensions.process)) {
      telemetryPath = `payload.histograms.${$store.probe.name}`;
    } else {
      telemetryPath = `payload.processes.${$store.productDimensions.process}.histograms.${$store.probe.name}`;
    }
  }

  const getRedash = (clicked, hov, path, tableName) => {
    let buildOne = `${dateFormatter(getDateFromPoint(clicked))} ${timeFormatter(
      getDateFromPoint(clicked)
    )}`;
    let buildTwo = `${dateFormatter(getDateFromPoint(hov))} ${timeFormatter(
      getDateFromPoint(hov)
    )}`;
    return (
      'https://sql.telemetry.mozilla.org/queries/82226/source?' +
      `p_Build 1=${buildOne}&p_Build 2=${buildTwo}` +
      '&p_Days%20to%20Query=7' +
      `&p_OS=${$store.productDimensions.os}` +
      `&p_Probe=${path}` +
      `&p_Start%20Date=${dateFormatter(
        getDateFromPoint(clicked)
      )}&p_Start%20Date%202=${dateFormatter(getDateFromPoint(hov))}` +
      `&p_Table=telemetry.${tableName}`
    );
  };
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
    font-size: var(--text-02);
    color: var(--cool-gray-600);
  }
  div.head {
    margin-bottom: 5px;
    font-size: var(--text-01);
  }
  div.range {
    padding: 1px 15px;
    grid-gap: 5px;
    display: flex;
    flex-direction: row;
  }
  div.key {
    width: 20%;
    font-weight: bold;
  }
  div.value {
    font-family: var(--main-mono-font);
    width: 80%;
  }
  div.value span {
    font-weight: bold;
  }
  div.options {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 30px 1fr;
    grid-template-areas: 'option-icon option-text';
  }
  div.option {
    display: contents;
  }
  div.option:hover > div {
    background-color: #e5e7eb;
  }
  div.option-icon {
    padding: 5px 5px 5px 15px;
  }
  div.option-link {
    padding: 5px 15px 5px 5px;
  }
  div.option-icon a {
    display: block;
    cursor: pointer;
    text-decoration: none;
    color: var(--digital-blue-500);
  }
  div.option-link a {
    text-transform: uppercase;
    display: block;
    cursor: pointer;
    text-decoration: none;
    color: var(--digital-blue-500);
    font-size: var(--text-02);
  }
</style>

<svelte:body on:click={onClickOutside} on:keydown|stopPropagation={onEscape} />

{#if $showContextMenu}
  <div
    id="menu"
    style="top: {y + window.scrollY}px; left: {x + window.scrollX}px;"
    on:click={closeMenu}
    bind:this={elem}>
    <div class="head">
      <div class="range">
        <div class="key">Range:</div>
        <div class="value">
          <span>{dateFormatter(getDateFromPoint(clickedHov))}</span>
          {timeFormatter(getDateFromPoint(clickedHov))}
        </div>
      </div>
      <div class="range">
        <div class="key">to:</div>
        <div class="value">
          <span>{dateFormatter(getDateFromPoint(clickedRef))}</span>
          {timeFormatter(getDateFromPoint(clickedRef))}
        </div>
      </div>
    </div>
    <div class="options">
      <div class="option">
        <div class="option-icon">
          <a href={zoomUrl} on:click|preventDefault={engageZoom}>
            <ZoomIn size="12" />
          </a>
        </div>
        <div class="option-link">
          <a href={zoomUrl} on:click|preventDefault={engageZoom}>
            Zoom to Range
          </a>
        </div>
      </div>
      <div class="option">
        <div class="option-icon">
          <a href={getRedash(clickedRef, clickedHov, telemetryPath, table)}>
            <Graphs size="12" />
          </a>
        </div>
        <div class="option-link">
          <a href={getRedash(clickedRef, clickedHov, telemetryPath, table)}
            >View Comparison in Redash</a>
        </div>
      </div>
      {#if pushlogUrl}
        <div class="option">
          <div class="option-icon">
            <a href={pushlogUrl} target="pushlog">
              <GitBranch size="12" />
            </a>
          </div>
          <div class="option-link">
            <a href={pushlogUrl} target="pushlog">View Changesets in Range</a>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
