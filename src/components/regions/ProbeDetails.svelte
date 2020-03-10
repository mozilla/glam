<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';
import Button from 'udgl/Button.svelte';
import StatusLabel from 'udgl/StatusLabel.svelte';
import ExternalLink from 'udgl/icons/ExternalLink.svelte';
import telemetrySearch from '../../state/telemetry-search';
import { store, dataset } from '../../state/store';

import { downloadString } from '../../utils/download';


const paneTransition = { x: 10, duration: 300 };
const PROBE_TYPE_DOCS = {
  histogram: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/histograms.html',
  scalar: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/scalars.html',
  event: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/events.html',
  default: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/index.html',
};

let visible = false;
onMount(() => { visible = true; });

function probeIsSelected(probe) {
  return probe.name !== null && probe.name !== 'null';
}

</script>

<style>

.drawer-section {
    padding: var(--space-2x);
}

.drawer-section--end {
    align-self: end;
    min-height: calc(var(--increment)*2);
}

.drawer-section-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.probe-details {
    height: 100%;
}

h2 {
    padding-bottom: var(--space-base);
}

.empty-details {
    height: 200px;
    display: grid;
    place-items: center center;
    font-weight: 900;
    font-size: 1.2em;
    text-align: center;
    padding: var(--space-2x);
    color: var(--cool-gray-400);
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

.spinner-and-text {
    text-align: center;
    color: var(--cool-gray-400);
}

.spinner-and-text div {
    margin-top: var(--space-base);
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
    padding: var(--space-2x);
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

</style>

<div class="drawer right-drawer">
{#if !$telemetrySearch.loaded}
    {#if visible}
    <div in:fly={paneTransition} class="drawer-section">
        <div class="spinner-and-text">
            <LineSegSpinner size={48} color={'var(--cool-gray-400)'} />
            <div in:fade={{ duration: paneTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if probeIsSelected($store.probe)}
<div in:fly={paneTransition} class="drawer-section-container probe-details">
    <!-- probe-details-content -->
    <div class="probe-details-content">
        <div class="probe-details-overview">
        {#if $store.probe.type}
            <dl class="drawer-section probe-details-overview-left">
                <dt>
                    <a class="probe-type-link" href={PROBE_TYPE_DOCS[$store.probe.type] || PROBE_TYPE_DOCS.default}>
                        {$store.probe.type}
                    </a>
                </dt>
                {#if $store.probe.kind}
                    <dd>{$store.probe.kind}</dd>
                {/if}
            </dl>
        {/if}
        {#if $store.probe.active !== undefined}
            <div class="probe-details-overview-right">
                <StatusLabel tooltip={$store.probe.active ? 'this probe is currently active and collecting data' : 'this probe is inactive and is thus not collecting data'} level={$store.probe.active ? 'success' : 'info'}>
                    {$store.probe.active ? 'active' : 'inactive'}
                </StatusLabel>
            </div>
        {/if}
        </div>
        {#if $store.versions && $store.versions.length}
            <dl class="drawer-section probe-details-overview-left probe-details-overview-left--subtle">
                <dt>{$store.channel}</dt>
                <dd class="probe-details-overview-left--padded">
                    {$store.probe.versions[$store.channel][0]}
                    &ndash; {$store.probe.versions[$store.channel][1]}
                </dd>
            </dl>
        {/if}
        <div class=drawer-section>
            {#if $store.probe.description}
                <h2 class="detail__heading--01">description</h2>
                <div class="probe-description helper-text--01">
                    {@html $store.probe.description}
                    <a class="more-info-link" href={`https://probes.telemetry.mozilla.org/?view=detail&probeId=${$store.probe.apiName}`} target="_blank">
                        more info <ExternalLink size=12 />
                    </a>
                </div>
            {/if}
        </div>
        {#if $store.probe.bugs && $store.probe.bugs.length}
        <div class="drawer-section">
            <h2 class="detail__heading--01">associated bugs</h2>
            <div class="bug-list helper-text--01">
            {#each $store.probe.bugs as bugID, i (bugID)}
                <a
                href='https://bugzilla.mozilla.org/show_bug.cgi?id={bugID}'
                target="_blank">{bugID}</a>
            {/each}
            </div>
        </div>
        {/if}
    </div>
    <!-- /probe-details-content -->

    <!-- probe-details-download -->
    <div class="probe-details-download">
        <div class="drawer-section drawer-section--end">
            <h2 class="detail__heading--01">export</h2>
            {#await $dataset}
                <div>
                    <LineSegSpinner size={36} color={'var(--cool-gray-400)'} />
                </div>
            {:then value}
                <div in:fly={paneTransition}>
                <Button on:click={() => { downloadString(JSON.stringify(value), 'text', `${$store.probe.name}.json`); }} level=medium compact>to JSON</Button>
                </div>
            {:catch err}
                {err.message}
            {/await}
        </div>
    </div>
    <!-- /probe-details-download -->

</div>
{:else}
    <div class="drawer-section">
        <div class="empty-details">
            search for a telemetry probe above
        </div>
    </div>
{/if}
</div>
