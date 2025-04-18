<script>
  import _ from 'lodash';
  import { kebabCase } from 'change-case';
  import { fade } from 'svelte/transition';
  import { store } from '../state/store';
  import Modal from './Modal.svelte';
  import Database from './icons/Database.svelte';
  import FileCopy from './icons/FileCopy.svelte';
  import desktopTelemetrySql from '../stringTemplates/desktop-telemetry.tpl';
  import desktopDistributionSql from '../stringTemplates/desktop-distribution.tpl';
  import desktopHistogramProportionsSql from '../stringTemplates/desktop-histogram-proportions.tpl';
  import fenixGlamSql from '../stringTemplates/fenix-glam.tpl';
  import desktopGlamSql from '../stringTemplates/desktop-glam.tpl';
  import fogTelemetrySql from '../stringTemplates/fog-telemetry.tpl';
  import fenixTelemetrySql from '../stringTemplates/fenix-telemetry.tpl';
  import notSupportedMsg from '../stringTemplates/not-supported.tpl';

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
  function getGlamSql() {
    const osFilter =
      $store.productDimensions.os === '*'
        ? 'os IS NULL'
        : `os="${$store.productDimensions.os}"`;
    const buildIdFilter =
      $store.productDimensions.aggregationLevel === 'build_id'
        ? 'app_build_id IS NOT NULL'
        : 'app_build_id IS NULL';
    const processFilter = $store.productDimensions.process
      ? `AND process="${$store.productDimensions.process}"`
      : '';
    return _.template(desktopGlamSql)({
      metric: $store.probe.name,
      channel: $store.productDimensions.channel,
      osFilter,
      buildIdFilter,
      processFilter,
    });
  }

  function getFenixGlamSql() {
    const buildIdFilter =
      $store.productDimensions.aggregationLevel === 'build_id'
        ? 'app_build_id!="*"'
        : 'app_build_id="*"';
    return _.template(fenixGlamSql)({
      app_id: $store.productDimensions.app_id,
      metric: $store.probe.name.replace('.', '_'),
      os: $store.productDimensions.os,
      ping_type: $store.productDimensions.ping_type,
      buildIdFilter,
    });
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
    const histogramType = $store.aggKey ? 'keyed_histograms' : 'histograms';
    const table =
      $store.productDimensions.channel === 'nightly'
        ? 'main_nightly'
        : 'main_1pct';
    if ($store.probe.type === 'histogram') {
      if (['main', 'parent'].includes(process)) {
        telemetryPath = `payload.${histogramType}.${$store.probe.name}`;
      } else {
        telemetryPath = `payload.processes.${process}.${histogramType}.${$store.probe.name}`;
      }
      if ($store.aggKey) {
        telemetryPath = `mozfun.map.get_key(${telemetryPath}, "${$store.aggKey}")`;
      }
    }
    const osFilter =
      $store.productDimensions.os === '*'
        ? `-- AND normalized_os="Windows" -- To add OS filter.`
        : `AND normalized_os="${$store.productDimensions.os}"`;

    const buildId = $store.ref || $store.defaultRef;
    const normalized =
      $store.productDimensions.normalizationType === 'normalized';

    return _.template(sqlTemplate)({
      metric: $store.probe.name,
      channel: $store.productDimensions.channel,
      table,
      telemetryPath,
      osFilter,
      buildId,
      normalized,
    });
  }

  function getGleanSql() {
    const supportedMetricTypes = [
      'timing_distribution',
      'memory_distribution',
      'custom_distribution',
    ];
    const appId = $store.productDimensions.app_id;
    const metric = $store.probe.name.replaceAll('.', '_');
    const { os } = $store.productDimensions;
    const pingType = $store.productDimensions.ping_type;
    const metricType = $store.probe.type;
    const productTemplateMap = {
      fog: fogTelemetrySql,
      fenix: fenixTelemetrySql,
    };
    const template = supportedMetricTypes.includes(metricType)
      ? productTemplateMap[$store.product]
      : notSupportedMsg;
    const sampleMult = appId === 'release' ? 100 : 1;
    const sampleSize = appId === 'release' ? 0 : 99;
    const normalized =
      $store.productDimensions.normalizationType === 'normalized';
    return _.template(template)({
      metric_name: metric,
      metric_type: metricType,
      channel: appId,
      ping_type: pingType,
      os,
      sample_mult: sampleMult,
      sample_size: sampleSize,
      normalized,
    });
  }

  const tabs = [];
  if ($store.product === 'firefox') {
    tabs.push({
      id: 2,
      label: 'GLAM SQL',
      sql: getGlamSql,
    });
    // Telemetry SQL only works on histograms.
    if ($store.probe.type === 'histogram') {
      tabs.push({
        id: 1,
        label: 'Telemetry SQL',
        sql: getDesktopSql,
      });
    }
  } else if ($store.product === 'fenix') {
    tabs.push(
      {
        id: 1,
        label: 'Telemetry SQL',
        sql: getGleanSql,
      },
      {
        id: 2,
        label: 'GLAM SQL',
        sql: getFenixGlamSql,
      }
    );
  } else if ($store.product === 'fog') {
    tabs.push({
      id: 1,
      label: 'Telemetry SQL',
      sql: getGleanSql,
    });
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
    <button on:click={open} class="docs-button" data-glean-id="view-sql-query">
      <Database size={16} />
      View SQL Query
    </button>
  </div>
  <div slot="title">Explore the data...</div>
  <div>
    <p>
      The following SQL query can be copied and used in the BigQuery console to
      explore further. Please note that you need internal access to our analysis
      tooling to query the data.
    </p>
    <ul>
      {#each tabs as tab}
        <li class:active={activeTab === tab.id}>
          <span
            class="tab"
            on:click={() => {
              activeTab = tab.id;
            }}>{tab.label}</span
          >
        </li>
      {/each}
      <li>
        {#if status}
          <span
            contenteditable="true"
            bind:textContent={status}
            transition:fade
          />
        {/if}
      </li>
      <li />
    </ul>

    {#each tabs as tab}
      {#if activeTab === tab.id}
        <pre>
          <code bind:this={sqlElement}
            >{tab.sql()}
          </code>
          <div class="buttons">
            <button
              class="copy"
              on:click={copySql}
              title="Copy to clipboard"
              data-glean-id="copy-sql-query__{kebabCase(tab.label)}">
              <FileCopy size={24} />
            </button>
          </div>
        </pre>
      {/if}
    {/each}
  </div>
</Modal>
