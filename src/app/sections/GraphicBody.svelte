<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import {
  store, dataset,
} from '../store/store';

import ScalarAggregationView from '../patterns/body/scalars/ScalarAggregationView.svelte';
import NumericHistogramView from '../patterns/body/histograms/NumericHistogramView.svelte';

function isScalarData(data) {
  return data[0].metadata.metric_type === 'scalar';
}

function isNumericHistogramData(data) {
  return data[0].metadata.metric_type === 'histogram-exponential' || data[0].metadata.metric_type
    === 'histogram-linear';
}

let container;
let width;

</script>

<style>
.graphic-body-container {
    padding: var(--space-4x);
    overflow-y: auto;
    height: calc(100vh - var(--header-height) - var(--space-4x) * 2);
    background-color: white;
}

.graphic-body__graphic-header {
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    align-items: start;
}

.graphic-body__graphic-header h2 {
    margin:0;
    padding:0;
    width: 100%;
    word-break: break-all;
}

.TEMP {
    background-color: white;
}

</style>

<svelte:window bind:innerWidth={width} />

<div bind:this={container} class=graphic-body-container>

    <div class=graphic-body__graphic-header>
    {#if $store.probe.name}
        <h2 class='heading--03'>{$store.probe.name}</h2>
    {:else}
        <h2 class='heading--04'>Telemetry Prototype</h2>
    {/if}
    </div>

    <div class=TEMP>
        {#await $dataset}
            running query
            <!-- <Spinner /> -->
        {:then data}
            <div in:fade>
                {#if isScalarData(data.response)}
                    <ScalarAggregationView data={data.response} />
                {:else if isNumericHistogramData(data.response)}
                    <NumericHistogramView data={data.response} />
                {:else}
                    <pre>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                {/if}
            </div>

        {:catch err}
            An error was caught: {err}
        {/await}
    </div>
</div>
