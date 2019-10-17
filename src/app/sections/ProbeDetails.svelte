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
    display: grid;
    grid-template-rows: max-content;
}

.probe-details {
    grid-template-rows: max-content;
    height: 100%;
}


h2 {
    padding-bottom: var(--space-base);
}

.empty-details {
    height: 200px;
    display:grid;
    place-items: center center;
    font-weight:900;
    font-size: 1.2em;
    text-align:center;
    padding: var(--space-2x);
    color: var(--cool-gray-400);
}

.probe__description {
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
    text-align:center;
    color: var(--cool-gray-400);
}

.spinner-and-text div {
    margin-top: var(--space-base);
}

.probe-labels {
    display:grid;
    grid-auto-flow:column;
    align-items: baseline;
}

</style>

<RightDrawer visible={paneVisible}>
{#if !$telemetrySearch.loaded}
    {#if visible}
    <div in:fly={rightDrawerTransition} class=drawer-section>
        <div class=spinner-and-text>
            <LineSegSpinner size={48} color={'var(--cool-gray-400)'} /> 
            <div in:fade={{ duration: rightDrawerTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if $store.probe.name}
<div in:fly={rightDrawerTransition} class="drawer-section-container probe-details">
    {#if $store.probe.type}
        <div class="drawer-section probe-labels">
            <div>
                <span
                    style="display: inline-block;"
                    class='label label-text--01 label--{$store.probe.type}'>{$store.probe.type}</span>
            </div>
            {#if $store.probe.kind}
                <div class="probe-kind label-text--01">
                    {$store.probe.kind}
                </div>
            {/if}
        </div>
    {/if}
    <div class=drawer-section>
        {#if $store.probe.description}
            <h2 class=detail__heading--01>description</h2>
            <div class='probe__description helper-text--01'>
                {@html $store.probe.description}
            </div>
        {/if}
    </div>
    {#if $store.probe.bugs && $store.probe.bugs.length}
    <div class="drawer-section">
            <h2 class=detail__heading--01>associated bugs</h2>
            <div class="bug-list helper-text--01">
            {#each $store.probe.bugs as bugID, i (bugID)}
                <a
                href='https://bugzilla.mozilla.org/show_bug.cgi?id={bugID}'
                target="_blank">{bugID}</a>
            {/each}
            </div>
    </div>
    {/if}
    <div class='drawer-section drawer-section--end'>
        <h2 class=detail__heading--01>export</h2>
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
{:else}
    <div class=drawer-section>
        <div class=empty-details>
            search for a telemetry probe above
        </div>
    </div>
{/if}
</RightDrawer>
