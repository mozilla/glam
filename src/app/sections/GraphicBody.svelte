<script>
import { fade } from 'svelte/transition';
import {
  store, dataset, visiblePercentiles, timeHorizon,
} from '../store/store';

import QuantileExplorerView from '../patterns/body/quantiles/QuantileExplorerView.svelte';
import ProportionExplorerView from '../patterns/body/proportions/ProportionExplorerView.svelte';

import { firefoxVersionMarkers } from '../store/product-versions';

function isScalarData(data) {
  return (data && $store.probe.type === 'scalar' && $store.probe.kind === 'uint');
}

function isNumericHistogramData(data) {
  return data && $store.probe.type === 'histogram' && ($store.probe.kind === 'linear' || $store.probe.kind === 'exponential');
}

function isCategoricalData(data) {
  return data && (($store.probe.type === 'histogram' && $store.probe.kind === 'enumerated')
  || $store.probe.kind === 'categorical' || $store.probe.kind === 'flag' || $store.probe.kind === 'boolean');
}

let container;
let width;

</script>

<style>
.graphic-body-container {
    overflow-y: auto;
    height: calc(100vh - var(--header-height));
    background-color: white;
}

.graphic-body__graphic-header {
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    align-items: start;
    background-color: var(--cool-gray-100);
    border-bottom: 1px solid var(--line-gray-01);
}

.graphic-body__graphic-header h2 {
    margin:0;
    padding:0;
    width: 100%;
    word-break: break-all;
    height: var(--increment);
    display: grid;
    align-items: center;
    padding-left: var(--space-4x);
    
}

.graphic-body__content {
    background-color: white;
    padding: var(--space-4x);
    padding-top: var(--space-2x);
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

    <div class=graphic-body__content>
        {#if $dataset.key === 'DEFAULT_VIEW'}
            <div>Telemetry dashboard default view goes here</div>
        {:else if $dataset.data}
            {#await $dataset.data}
                running query
            {:then data}
                <div in:fade>
                    {#if isCategoricalData(data.response)}
                        <ProportionExplorerView 
                            markers={$firefoxVersionMarkers} 
                            data={data.response} 
                            probeType={`${$store.probe.type}-${$store.probe.kind}`}  
                        />
                    {:else if isScalarData(data.response) || isNumericHistogramData(data.response)}                    
                        <QuantileExplorerView markers={$firefoxVersionMarkers}
                            data={data.response}
                            probeType={isScalarData(data.response) ? 'scalar' : 'histogram'}
                            timeHorizon={$store.timeHorizon}
                            percentiles={$store.visiblePercentiles}
                            on:selection={(event) => {
                                const { selection, type } = event.detail;
                                if (type === 'percentiles') store.dispatch(visiblePercentiles.set(selection));
                                if (type === 'timeHorizon') store.dispatch(timeHorizon.set(selection));
                            }}
                        />
                    {:else}
                        <pre>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    {/if}
                </div>
            {:catch err}
                An error was caught: {err}
            {/await}
        {:else}
            <div>{$dataset.key}</div>
        {/if}
        
    </div>
</div>
