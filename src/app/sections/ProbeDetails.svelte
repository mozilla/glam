<script>
import { fly, fade } from 'svelte/transition';
import RightDrawer from '../../components/sections/RightDrawer.svelte';
import Accordion from '../../components/Accordion.svelte';
import Button from '../../components/Button.svelte';

import AudienceSize from './AudienceSize.svelte';

import { store } from '../store/store'
let visible = true;

let audienceCount;
let populationCount;
let audiencePerc;

let currentProbeName = $store.probe.name;

$: if(currentProbeName !== $store.probe.name) {
    currentProbeName = $store.probe.name;
    audienceCount = 500000 + Math.random() * 500000;
    populationCount = 1200000 + Math.random() * 1000000;
    audiencePerc = audienceCount / populationCount;
}

</script>

<style>

.drawer-section {
    /* font-size:.8em; */
    /* color: var(--gray10); */
    /* font-size: var(--text-q2); */
    padding: var(--space-2x);
    border-bottom: 1px solid var(--gray01);
}

.drawer-section-description {
    font-style: italic;
    padding-bottom: var(--space-base);
    margin-top: calc(var(--space-base) * -1);
    color: var(--body-gray);
}

.drawer-section-container {
    display: grid;
    grid-template-rows: auto;
}

.probe-details {
    grid-template-rows: max-content max-content auto auto;
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
    /* background-color: var(--gray01); */
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

</style>

<RightDrawer {visible}>
{#if $store.probe.name}
<div class="drawer-section-container probe-details">
    <div class="drawer-section">
            <h2 class=details__heading--01>Audience Size</h2>
            <div class='drawer-section-description label-text--01'>perc. of channel</div>
            <AudienceSize percentage={audiencePerc} total={audienceCount} population={populationCount} />
    </div>
    <div class=drawer-section>
        {#if $store.probe.description}
            <h2 class=details__heading--01>description</h2>
            <div class='probe__description helper-text--01'>
                {@html $store.probe.description}
            </div>
        {/if}
    </div>
    <div class="drawer-section">
            <h2 class=details__heading--01>associated bugs</h2>
    </div>
    <!-- <div class=drawer-section>
            <h2>related probes</h2>
    </div> -->
    <!-- <div class='drawer-section align-end'>
        <h2>export</h2>
        <div class='export-buttons'>
            <Button level="medium" compact>open dataset in redash</Button>
            <Button level="medium" compact>export as csv</Button>
            <Button level="medium" compact>export as json</Button>
            <Button level="medium" compact>explore data in iodide</Button>
        </div>
    </div> -->
</div>
{:else}
    <div class=drawer-section>
        <div class=empty-details>
            search for a telemetry probe above
        </div>
    </div>
{/if}
</RightDrawer>

<!-- <button class=fab on:click={() => { visible = !visible; }}>{visible ? "hide" : "show"}</button> -->