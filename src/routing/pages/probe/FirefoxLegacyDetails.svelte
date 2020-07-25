<script>
import ExternalLink from 'udgl/icons/ExternalLink.svelte';
import StatusLabel from 'udgl/StatusLabel.svelte';
import Doc from '../../../components/Doc.svelte';

import { store, probe } from '../../../state/store';

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
<div class="probe-details-content">
  <div class="probe-details-overview">
    {#if $probe.type}
      <dl class="drawer-section probe-details-overview-left">
        <dt>
          <a
            class="probe-type-link"
            href={PROBE_TYPE_DOCS[$probe.type] || PROBE_TYPE_DOCS.default}>
            {$probe.type}
          </a>
        </dt>
        {#if $probe.kind}
          <dd>{$probe.kind}</dd>
        {/if}
      </dl>
    {/if}
    {#if $probe.active !== undefined}
      <div class="probe-details-overview-right">
        <StatusLabel
          tooltip={$probe.active ? 'this probe is currently active and collecting data' : 'this probe is inactive and is thus not collecting data'}
          level={$probe.active ? 'success' : 'info'}>
          {$probe.active ? 'active' : 'inactive'}
        </StatusLabel>
      </div>
    {/if}
  </div>
  {#if $store.versions && $store.versions.length}
    <dl
      class="drawer-section probe-details-overview-left
      probe-details-overview-left--subtle">
      <dt>{$store.productDimensions.channel}</dt>
      <dd class="probe-details-overview-left--padded">
        {$probe.versions[$store.productDimensions.channel][0]} &ndash; {$probe.versions[$store.productDimensions.channel][1]}
      </dd>
    </dl>
  {/if}
  <div class="drawer-section">
    {#if $probe.description}
      <h2 class="detail__heading--01">description</h2>
      <div class="probe-description helper-text--01">
        {@html $probe.description}
        <a
          class="more-info-link"
          href={`https://probes.telemetry.mozilla.org/?view=detail&probeId=${$probe.apiName}`}
          target="_blank">
          more info
          <ExternalLink size="12" />
        </a>
      </div>
    {/if}
  </div>
  {#if $probe.bugs && $probe.bugs.length}
    <div class="drawer-section">
      <h2 class="detail__heading--01">associated bugs</h2>
      <div class="bug-list helper-text--01">
        {#each $probe.bugs as bugID, i (bugID)}
          <a
            href="https://bugzilla.mozilla.org/show_bug.cgi?id={bugID}"
            target="_blank">
            {bugID}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
<!-- /probe-details-content -->

<!-- probe-details-download -->
<div class="probe-details-download">

  <div class="drawer-section drawer-section--end">
    <!-- FIXME: once @graph-paper/button supports href, use that instead. -->
    <!-- <button
        on:click={exportData}
        class="docs-button"
      >
        <Brackets size={16} /> Export to JSON
      </button> -->
    <a
      class="docs-button"
      href="https://docs.google.com/document/d/1qIkEDemnODbYuVIfpciohgEXcaFjrK_mfVG5FOSeVuM/preview"
      target="_blank">
      <Doc size={16} />
      Documentation
    </a>
  </div>
</div>
<!-- /probe-details-download -->
