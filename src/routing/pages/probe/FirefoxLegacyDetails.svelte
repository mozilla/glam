<script>
  import Brackets from '../../../components/icons/Brackets.svelte';
  import { store, dataset } from '../../../state/store';
  import { downloadString } from '../../../utils/download';
  import ExternalLink from '../../../components/icons/ExternalLink.svelte';
  import StatusLabel from '../../../components/StatusLabel.svelte';
  import SqlModal from '../../../components/SqlModal.svelte';
  import Markdown from '../../../components/Markdown.svelte';

  export let showLinks = true;

  const PROBE_TYPE_DOCS = {
    histogram:
      'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/histograms.html',
    scalar:
      'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/scalars.html',
    event:
      'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/events.html',
    default:
      'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/index.html',
  };

  async function exportData() {
    const data = await $dataset;
    downloadString(JSON.stringify(data), `${$store.probe.name}.json`, 'text');
  }
  const isProbeActive = $store.probe.active;
</script>

<style>
  .drawer-section {
    padding: var(--space-2x) 0;
  }
  .drawer-section--end {
    align-self: end;
    min-height: calc(var(--increment) * 2);
    position: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--space-base);
  }

  h2 {
    padding-bottom: var(--space-base);
  }

  .probe-description {
    color: var(--subhead-gray-02);
    word-break: break-word;
  }

  .bug-list {
    display: flex;
    flex-wrap: wrap;
    line-height: 1.8;
  }

  .bug-list a {
    display: block;
    margin-right: var(--space-base);
  }
  .probe-details-overview-left {
    margin: 0;
  }

  .probe-details-overview-left > * {
    line-height: 1.2;
  }

  .probe-details-overview-left dt {
    text-transform: capitalize;
    color: var(--subhead-gray-01);
    font-size: var(--text-04);
    font-weight: 500;
  }

  .probe-details-overview-left dd {
    margin: 0;
    font-size: var(--text-015);
    color: var(--subhead-gray-01);
  }

  .probe-details-overview-left--padded {
    padding: 0 calc(var(--space-base) - 1px);
  }

  .probe-details-overview-left--subtle {
    display: flex;
    justify-content: space-between;
    padding-top: 0;
    align-items: baseline;
  }

  .probe-details-overview-left--subtle dt {
    text-transform: none;
    font-size: var(--text-02);
  }

  .probe-details-overview-left--subtle dd {
    font-size: var(--text-01);
  }

  .probe-details-overview {
    display: flex;
    justify-content: space-between;
  }

  .probe-details-overview-right {
    padding: var(--space-2x) 0;
  }

  .more-info-link {
    display: grid;
    align-items: center;
    grid-auto-flow: column;
    grid-column-gap: var(--space-1h);
    justify-content: end;
    font-weight: 300;
    padding-right: var(--space-1h);
    margin: var(--space-2x) 0;
    font-size: var(--text-01);
  }

  .probe-type-link {
    color: var(--subhead-gray-01);
  }

  /* FIXME: once @graph-paper/button supports href, use the Button component. */
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
</style>

<!-- probe-details-content -->
{#if $store.probe}
  <div class="probe-details-content">
    <div class="probe-details-overview">
      {#if $store.probe.type}
        <dl class="drawer-section probe-details-overview-left">
          <dt>
            <a
              class="probe-type-link"
              href={PROBE_TYPE_DOCS[$store.probe.type] ||
                PROBE_TYPE_DOCS.default}
            >
              {$store.probe.type}
            </a>
          </dt>
          {#if $store.probe.kind}
            <dd>{$store.probe.kind}</dd>
          {/if}
        </dl>
      {/if}
      {#if isProbeActive !== undefined}
        <div class="probe-details-overview-right">
          <StatusLabel
            tooltip={isProbeActive
              ? 'this probe is currently active and collecting data'
              : 'this probe is inactive and is thus not collecting data'}
            level={isProbeActive ? 'success' : 'info'}
          >
            {isProbeActive ? 'active' : 'inactive'}
          </StatusLabel>
        </div>
      {/if}
    </div>
    {#if $store.probe.versions[$store.productDimensions.channel]}
      <dl
        class="drawer-section probe-details-overview-left
        probe-details-overview-left--subtle"
      >
        <dt>{$store.productDimensions.channel}</dt>
        <dd class="probe-details-overview-left--padded">
          {$store.probe.versions[$store.productDimensions.channel].first}
          &ndash;
          {$store.probe.versions[$store.productDimensions.channel].last}
        </dd>
      </dl>
    {/if}
    <div class="drawer-section">
      {#if $store.probe.description}
        <h2 class="detail__heading--01">description</h2>
        <div class="probe-description helper-text--01">
          <Markdown text={$store.probe.description} />
          <a
            class="more-info-link"
            href={`https://probes.telemetry.mozilla.org/?view=detail&probeId=${$store.probe.id}`}
            target="_blank"
          >
            more info
            <ExternalLink size="12" />
          </a>
          {#if $store.aggMethod}
            <h2 class="detail__heading--01">aggregation method</h2>
            <p>{$store.aggMethod}</p>
          {/if}
        </div>
      {/if}
    </div>
    {#if $store.probe.bug_numbers && $store.probe.bug_numbers.length && showLinks}
      <div class="drawer-section">
        <h2 class="detail__heading--01">associated bugs</h2>
        <div class="bug-list helper-text--01">
          {#each $store.probe.bug_numbers as bugID, i (bugID)}
            <a
              href="https://bugzilla.mozilla.org/show_bug.cgi?id={bugID}"
              target="_blank"
            >
              {bugID}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  {#if showLinks}
    <div class="probe-details-download">
      <div class="drawer-section drawer-section--end">
        <SqlModal />
        <button
          on:click={exportData}
          class="docs-button"
          data-glean-id="export-json"
        >
          <Brackets size={16} />
          Export to JSON
        </button>
      </div>
    </div>
  {/if}
{/if}
