<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import RightDrawer from '../../components/sections/RightDrawer.svelte';
import LineSegSpinner from '../../components/LineSegSpinner.svelte';
import telemetrySearch from '../store/telemetry-search';

import { downloadString } from '../../utils/download';

import Button from '../../components/Button.svelte';

// import AudienceSize from './AudienceSize.svelte';
const rightDrawerTransition = { x: 10, duration: 300 };
import { store, dataset } from '../store/store';

let paneVisible = true;
let visible = false; // this is unused for the time being.
onMount(() => { visible = true; });

function probeIsSelected(probe) {
  return probe.name !== null && probe.name !== 'null';
}

</script>

<style>

.drawer-section {
    padding: var(--space-2x);
    border-bottom: 1px solid var(--line-gray-01);
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
}

.bug-list {
    display: flex;
}

.bug-list a {
    display: block;
    margin-right: var(--space-2x);
}

.spinner-and-text {
    text-align: center;
    color: var(--cool-gray-400);
}

.spinner-and-text div {
    margin-top: var(--space-base);
}

.probe-labels {
    padding: 0;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    grid-column-gap: var(--space-2x);
    height: var(--increment);
}

.drawer-header {
    background: transparent;
    border: 0;
    color: var(--body-gray-02);
    height: auto;
    margin-bottom: var(--space-base);
}

.details-list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.details-list > * {
    margin: 0 0 var(--space-base) 0;
}

.details-list > *:last-child {
    margin-bottom: 0;
}

.detail--indented {
    position: relative;
    padding-left: var(--space-2x);
    font-size: var(--text-015);
}

.detail--indented::before {
    content: ">";
    position: absolute;
    height: var(--space-base);
    width: var(--space-base);
    top: 0;
    left: 0;
    color: var(--cool-gray-400);
}

</style>

<RightDrawer visible={paneVisible}>
{#if !$telemetrySearch.loaded}
    {#if visible}
    <div in:fly={rightDrawerTransition} class="drawer-section">
        <div class="spinner-and-text">
            <LineSegSpinner size={48} color={'var(--cool-gray-400)'} /> 
            <div in:fade={{ duration: rightDrawerTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if probeIsSelected($store.probe)}
<div in:fly={rightDrawerTransition} class="drawer-section-container probe-details">
    <!-- probe-details-content -->
    <div class="probe-details-content">
        {#if $store.probe.type}
            <div class="drawer-section probe-labels">
                <div>
                    <span
                        style="display: inline-block;"
                        class="label label-text--01 label--{$store.probe.type}">{$store.probe.type}</span>
                </div>
                {#if $store.probe.kind}
                    <div class="probe-kind label-text--01">
                        {$store.probe.kind}
                    </div>
                {/if}
            </div>
        {/if}
        <div class="drawer-section">
            <ul class="details-list">
            {#if $store.probe.active !== undefined}
                <li class="detail--indented">
                {#if $store.probe.active}
                    active
                {:else}
                    inactive
                {/if}
                </li>
            {/if}
            {#if $store.versions && $store.versions.length}
                <li class="detail--indented">
                    available in {$store.channel}: {$store.probe.versions[$store.channel][0]}
                    &ndash; {$store.probe.versions[$store.channel][1]}
                </li>
            {/if}
            </ul>
        </div>
        <div class=drawer-section>
            {#if $store.probe.description}
                <h2 class="detail__heading--01">description</h2>
                <div class="probe-description helper-text--01">
                    {@html $store.probe.description}
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
                <div in:fly={rightDrawerTransition}>
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
</RightDrawer>
