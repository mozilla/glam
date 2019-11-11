<script>
import { fade } from 'svelte/transition';
import {
  store, dataset, extractBucketMetadata,
} from '../store/store';
import {
  visiblePercentiles, timeHorizon, activeBuckets, proportionMetricType, applicationStatus,
} from '../store/actions';

import QuantileExplorerView from '../patterns/body/quantiles/QuantileExplorerView.svelte';
import ProportionExplorerView from '../patterns/body/proportions/ProportionExplorerView.svelte';


import { firefoxVersionMarkers } from '../store/product-versions';

function isScalarData(data) {
  return (data && $store.probe.type === 'scalar' && $store.probe.kind === 'uint');
}

function isNumericHistogramData() {
  return $store.probe.type === 'histogram' && ($store.probe.kind === 'linear' || $store.probe.kind === 'exponential');
}

function isCategoricalData() {
  return (($store.probe.type === 'histogram' && $store.probe.kind === 'enumerated')
  || $store.probe.kind === 'categorical' || $store.probe.kind === 'flag' || $store.probe.kind === 'boolean');
}


let probeName;
let output = Promise.resolve({});
// FIXME: for now, once we have retreived the data set, there are
// a few additional operations that need to be performed.
// to start, we will need to reset the activeBuckets in the non-
// initializing case.

// down the line, it would be good to figure out the right way to think
// about this whole pipeline. At the moment it does feel kind of weird to
// have the post-fetching step be in a component.
$: if ($store.probe.name !== probeName && $dataset.data) {
  probeName = $store.probe.name;
  output = $dataset.data.then(
    (transformedData) => {
      const isCategorical = isCategoricalData($store.probe);

      let etc = {};
      if (isCategorical) {
        etc = extractBucketMetadata(transformedData);
        if ($store.applicationStatus !== 'INITIALIZING') {
          store.dispatch(activeBuckets.set(etc.initialBuckets));
        }
      }
      store.dispatch(applicationStatus.set('ACTIVE'));
      return { data: transformedData, ...etc };
    },
  ).catch((err) => console.error(err));
}


let container;
let width;

function handleBodySelectors(event) {
  const { selection, type } = event.detail;
  if (type === 'percentiles') store.dispatch(visiblePercentiles.set(selection));
  if (type === 'timeHorizon') store.dispatch(timeHorizon.set(selection));
  if (type === 'metricType') store.dispatch(proportionMetricType.set(selection));
  if (type === 'activeBuckets') {
    //   const thisSelection = [...selection];
    // thisSelection.sort()
    store.dispatch(activeBuckets.set(selection));
    // FIXME: figure out where to set applicationStatus to 'ACTIVE'. Will do here for now.
    // store.dispatch(applicationStatus.set('ACTIVE'));
  }
}

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
            {#await output}
                running query
            {:then data}
                <div in:fade>
                    {#if isCategoricalData(data.response)}
                        <ProportionExplorerView 
                            markers={$firefoxVersionMarkers} 
                            data={data.data}
                            probeType={`${$store.probe.type}-${$store.probe.kind}`}
                            metricType={$store.proportionMetricType}
                            activeBuckets={[...$store.activeBuckets]}
                            timeHorizon={$store.timeHorizon}
                            bucketOptions={data.bucketOptions}
                            bucketColorMap={data.bucketColorMap}
                            bucketSortOrder={data.bucketSortOrder}
                            on:selection={handleBodySelectors}
                        />
                    {:else if isScalarData(data.response) || isNumericHistogramData(data.response)}                    
                        <QuantileExplorerView markers={$firefoxVersionMarkers}
                            data={data.data}
                            probeType={isScalarData(data.response) ? 'scalar' : 'histogram'}
                            timeHorizon={$store.timeHorizon}
                            percentiles={$store.visiblePercentiles}
                            on:selection={handleBodySelectors}
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
