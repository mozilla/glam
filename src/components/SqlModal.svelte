<script>
  import _ from 'lodash';
  import { fade } from 'svelte/transition';
  import { store } from '../state/store';
  import Modal from './Modal.svelte';
  import Database from './icons/Database.svelte';
  import FileCopy from './icons/FileCopy.svelte';
  import desktopTelemetrySql from '../stringTemplates/desktop-telemetry.tpl';
  import desktopDistributionSql from '../stringTemplates/desktop-distribution.tpl';
  import desktopHistogramProportionsSql from '../stringTemplates/desktop-histogram-proportions.tpl';

  let sqlElement;
  let status;
  let activeTab = 1;

  function copySql() {
    let range = document.createRange();
    range.selectNode(sqlElement);
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand('copy');
    window.getSelection().removeAllRanges(); // to deselect
    // Flash the sqlElement area to show we copied the text.
    sqlElement.style.backgroundColor = 'palegoldenrod';
    sqlElement.style.transition = 'background-color 0.5s';
    setTimeout(() => {
      sqlElement.style.backgroundColor = '';
      sqlElement.style.transition = '';
    }, 500);
  }

  function getDesktopSql(tpl = 'telemetry') {
    // TODO: Use the time horizon to date window in SQL?
    const { process } = $store.productDimensions;

    const templateMap = {
      telemetry: desktopTelemetrySql,
      distribution: desktopDistributionSql,
    };

    let sqlTemplate = templateMap[tpl];

    if (
      ['categorical', 'count', 'enumerated', 'flag'].includes($store.probe.kind)
    ) {
      sqlTemplate = desktopHistogramProportionsSql;
    }

    let telemetryPath;
    const table =
      $store.productDimensions.channel === 'nightly'
        ? 'main_nightly'
        : 'main_1pct';
    if ($store.probe.type === 'histogram') {
      if (['main', 'parent'].includes(process)) {
        telemetryPath = `payload.histograms.${$store.probe.name}`;
      } else {
        telemetryPath = `payload.processes.${process}.histograms.${$store.probe.name}`;
      }
      if ($store.aggKey) {
        telemetryPath = `mozfun.map.get_key(${telemetryPath}, ${$store.aggKey})`;
      }
    }
    const osFilter =
      $store.productDimensions.os === '*'
        ? `-- AND normalized_os="Windows" -- To add OS filter.`
        : `AND normalized_os="${$store.productDimensions.os}"`;

    const buildId = $store.ref || $store.defaultRef;

    return _.template(sqlTemplate)({
      metric: $store.probe.name,
      channel: $store.productDimensions.channel,
      table,
      telemetryPath,
      osFilter,
      buildId,
    });
  }

  const tabs = [];
  if ($store.product === 'firefox') {
    // Telemetry SQL only works on histograms.
    if ($store.probe.type === 'histogram') {
      tabs.push({
        id: 1,
        label: 'Telemetry SQL',
        sql: getDesktopSql,
      });
      tabs.push({
        id: 2,
        label: 'Distribution SQL',
        sql: getDesktopSql,
      });
    }
  }
</script>

<style>
  .docs-button {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: transparent;
    display: grid;
    width: 100%;
    color: var(--digital-blue-500);
    border: none;
    cursor: pointer;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    text-decoration: none;
    justify-content: center;
    grid-column-gap: var(--space-base);
    text-transform: uppercase;
    font-size: var(--text-015);
    font-weight: 500;
    padding: var(--space-base);
    transition: background-color 100ms;
    border-radius: var(--space-1h);
  }

  .docs-button:hover {
    background-color: var(--cool-gray-150);
  }

  button.copy {
    padding: 0;
    margin: auto;
    cursor: pointer;
    border: none;
  }

  ul {
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    grid-column-gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
    border-bottom: 1px solid var(--cool-gray-500);
  }

  li:nth-child(3) {
    text-align: right;
    vertical-align: middle;
    border: 0;
  }

  li.active > span {
    color: #495057;
    background-color: white;
    border-color: var(--cool-gray-700) var(--cool-gray-700) white;
  }

  span.tab {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span.tab:hover {
    border-color: var(--cool-gray-700) var(--cool-gray-700) var(--cool-gray-500);
  }

  pre {
    position: relative;
    margin: 0;
  }

  div.buttons {
    position: absolute;
    top: 5px;
    right: 10px;
    cursor: pointer;
  }

  code {
    display: block;
    font-family: monospace;
    overflow-x: auto;
    background-color: var(--cool-gray-100);
    padding: var(--space-base);
    height: 40vh;
  }
</style>

<Modal>
  <div slot="trigger" let:open>
    <button on:click={open} class="docs-button">
      <Database size={16} />
      View SQL Query
    </button>
  </div>
  <div slot="title">Explore the data...</div>
  <div>
    {#if $store.product === 'fog'}
      <p>Sorry, this feature is not available for Glean metrics yet.</p>
    {:else}
      <p>
        The following SQL query can be copy/pasted and used in the BigQuery
        console to explore this data further:
      </p>
    {/if}
    <ul>
      {#each tabs as tab}
        <li class:active={activeTab === tab.id}>
          <span
            class="tab"
            on:click={() => {
              activeTab = tab.id;
            }}>{tab.label}</span>
        </li>
      {/each}
      <li>
        {#if status}
          <span
            contenteditable="true"
            bind:textContent={status}
            transition:fade />
        {/if}
      </li>
      <li />
    </ul>

    {#each tabs as tab}
      {#if activeTab === tab.id}
        <pre>
          <code bind:this={sqlElement}>
            {tab.label.includes("Distribution") ? tab.sql("distribution") : tab.sql("telemetry")}
          </code>
          <div class="buttons">
            <button class="copy" on:click={copySql} title="Copy to clipboard">
              <FileCopy size={24} />
            </button>
          </div>
        </pre>
      {/if}
    {/each}
  </div>
</Modal>
