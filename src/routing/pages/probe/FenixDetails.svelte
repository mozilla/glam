<script>
  import { timeParse, timeFormat } from 'd3-time-format';
  import marked from 'marked';
  import Brackets from '../../../components/icons/Brackets.svelte';
  import { store, dataset } from '../../../state/store';
  import { downloadString } from '../../../utils/download';
  import { extractBugId } from '../../../utils/urls';
  import ExternalLink from '../../../components/icons/ExternalLink.svelte';
  import StatusLabel from '../../../components/StatusLabel.svelte';
  import SqlModal from '../../../components/SqlModal.svelte';

  async function exportData() {
    const data = await $dataset;
    downloadString(JSON.stringify(data), 'text', `${$store.probe.name}.json`);
  }

  const parseYMD = timeParse('%Y-%m-%d');
  const mdY = timeFormat('%b %d, %Y');
  const toNiceDate = (dt) => mdY(parseYMD(dt));
</script>

<style>
  .drawer-section {
    padding: var(--space-base) 0;
  }
  .drawer-section--end {
    align-self: end;
    min-height: calc(var(--increment) * 2);
    position: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--space-base);
  }

  .probe-type-link {
    color: var(--subhead-gray-01);
  }

  h2 {
    padding-bottom: var(--space-base);
  }

  .probe-description {
    color: var(--subhead-gray-02);
    word-break: break-word;
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

  dt,
  .detail-title {
    font-size: var(--text-015);
    text-transform: uppercase;
    font-weight: 300;
    color: var(--cool-gray-700);
  }

  dd {
    font-size: var(--text-02);
    margin: 0px;
    padding: 0px;
    color: var(--cool-gray-700);
  }

  .tiled {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: space-between;
  }
</style>

{#if $store.probe}
  <div class="probe-details-content">
    <div class="probe-details-overview">
      {#if $store.probe.type}
        <dl class="drawer-section probe-details-overview-left">
          <dt>
            <a
              class="probe-type-link"
              href="https://mozilla.github.io/glean/book/user/metrics/index.html"
              >{$store.probe.type.replace('_', ' ')}</a>
          </dt>
        </dl>
      {/if}
      <div class="probe-details-overview-right">
        <StatusLabel
          tooltip={!$store.probe.info.disabled
            ? 'this metric is currently active and collecting data'
            : 'this metric is inactive and is thus not collecting data'}
          level={!$store.probe.info.disabled ? 'success' : 'info'}>
          {!$store.probe.info.disabled ? 'active' : 'inactive'}
        </StatusLabel>
      </div>
    </div>

    <div class="drawer-section">
      {#if $store.probe.description}
        <h2 class="detail-title">description</h2>
        <div class="probe-description helper-text--01">
          {@html marked($store.probe.info.description)}
          <a
            class="more-info-link"
            href={`https://dictionary.telemetry.mozilla.org/apps/fenix/metrics/${$store.probe.name}`}
            target="_blank">
            more info
            <ExternalLink size="12" />
          </a>
        </div>
      {/if}
    </div>
    <div class="tiled">
      {#if $store.probe.info.send_in_pings}
        <dl>
          <dt>unit</dt>
          <dd>
            {$store.probe.info.time_unit ||
              $store.probe.info.memory_unit ||
              $store.probe.info.unit ||
              'n/a'}
          </dd>
        </dl>
      {/if}
      {#if $store.probe.info.expires}
        <dl>
          <dt>Expires</dt>
          <dd>
            {$store.probe.info.expires === 'never'
              ? 'never'
              : toNiceDate($store.probe.info.expires)}
          </dd>
        </dl>
      {/if}
    </div>
    <div class="drawer-section">
      <dl>
        <dt>Send in Pings</dt>
        <dd>
          {#each $store.probe.info.send_in_pings as ping}
            <div>{ping}</div>
          {/each}
        </dd>
      </dl>
    </div>
    <div class="drawer-section">
      {#if $store.probe.info.bugs}
        <dl>
          <dt>bugs</dt>
          <dd>
            {#each $store.probe.info.bugs as bug}
              <div><a href={bug}>{extractBugId(bug)}</a></div>
            {/each}
          </dd>
        </dl>
      {/if}
    </div>
    <div class="drawer-section">
      {#if $store.probe.info.data_reviews}
        <dl>
          <dt>data reviews</dt>
          <dd>
            {#each $store.probe.info.data_reviews as bug}
              <div><a href={bug}>{extractBugId(bug)}</a></div>
            {/each}
          </dd>
        </dl>
      {/if}
    </div>
    <dl>
      <dt>Notify</dt>
      <dd style="font-size: var(--text-015);">
        {#each $store.probe.info.notification_emails as email}
          <div>{email}</div>
        {/each}
      </dd>
    </dl>
  </div>
  <div class="probe-details-download">
    <div class="drawer-section drawer-section--end">
      <SqlModal />
      <button on:click={exportData} class="docs-button">
        <Brackets size={16} />
        Export to JSON
      </button>
    </div>
  </div>
{/if}
