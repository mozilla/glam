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
// let audienceCount;
// let populationCount;
// let audiencePerc;

// let currentProbeName = $store.probe.name;

// $: if (currentProbeName !== $store.probe.name) {
//   currentProbeName = $store.probe.name;
//   audienceCount = 500000 + Math.random() * 500000;
//   populationCount = 1200000 + Math.random() * 1000000;
//   audiencePerc = audienceCount / populationCount;
// }

</script>

<style>

.drawer-section {
    padding: var(--space-2x);
    border-bottom: 1px solid var(--line-gray-02);
}

/* .drawer-section-description {
    font-style: italic;
    padding-bottom: var(--space-base);
    margin-top: calc(var(--space-base) * -1);
    color: var(--body-gray);
} */

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

/* .align-end {
    align-self: end;
    margin-bottom: calc(var(--header-height) + var(--space-3x));
    border-bottom: none;
} */

h2 {
    padding-bottom: var(--space-base);
}

/* .export-buttons {
    display:grid;
    grid-template-rows: auto;
    grid-row-gap: var(--space-base);
} */

.empty-details {
    height: 200px;
    display:grid;
    place-items: center center;
    font-weight:900;
    font-size: 1.2em;
    text-align:center;
    padding: var(--space-2x);
    color: var(--gray05);
}

.probe__description {
    color: var(--body-gray);
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
    color: var(--subhead-gray);
}

.spinner-and-text div {
    margin-top: var(--space-base);
}

</style>

<RightDrawer visible={paneVisible}>
{#if !$telemetrySearch.loaded}
    {#if visible}
    <div in:fly={rightDrawerTransition} class=drawer-section>
        <div class=spinner-and-text>
            <LineSegSpinner size={48} color={'var(--subhead-gray)'} /> 
            <div in:fade={{ duration: rightDrawerTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if $store.probe.name}
<div in:fly={rightDrawerTransition} class="drawer-section-container probe-details">
    <!-- <div class="drawer-section">
            <h2 class=detail__heading--01>Audience Size</h2>
            <AudienceSize percentage={audiencePerc} total={audienceCount} population={populationCount} />
    </div> -->
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
                <LineSegSpinner size={36} color={'var(--subhead-gray)'} />
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
