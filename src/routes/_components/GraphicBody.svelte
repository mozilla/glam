<script>
import { fade, fly } from 'svelte/transition';

// FIXME: get rid of this once the API / dataset is fixed.
// until then, we will need to keep this, since it's our only
// way of reading from the probe info service, which has the
// accurate probe information.
import { derived } from 'svelte/store';

import {
  store, dataset,
} from '../../state/store';

import { getProbeViewType } from '../../utils/probe-utils';

import ProbeDetails from './ProbeDetails.svelte';

import QuantileExplorerView from '../explore/_view/QuantileExplorerView.svelte';
import ProportionExplorerView from '../explore/_view/ProportionExplorerView.svelte';
import ProbeTableView from '../../app/patterns/table-view/ProbeTableView.svelte';

import Spinner from '../../components/LineSegSpinner.svelte';

import { firefoxVersionMarkers } from '../../state/product-versions';

import DefaultBody from './DefaultBody.svelte';
import DataError from './errors/DataError.svelte';

// const getProbeViewType = (probeType, probeKind) => {
//   if (probeType === 'histogram' && probeKind === 'enumerated') return 'categorical';
//   if (isCategorical(probeType, probeKind)) return 'categorical';
//   if (probeType === 'histogram' && ['linear', 'exponential'].includes(probeKind)) return 'histogram';
//   if (probeType === 'scalar' && probeKind === 'uint') return 'scalar';
//   return undefined;
// };

// FIXME: for now, once we have retreived the data set, there are
// a few additional operations that need to be performed.
// to start, we will need to reset the activeBuckets in the non-
// initializing case.

// down the line, it would be good to figure out the right way to think
// about this whole pipeline. At the moment it does feel kind of weird to
// have the post-fetching step be in a component.

// ADDL FIXME: we should wait for the telemetry probes to load if that's what we're
// looking for here.

const temporaryViewTypeStore = derived(store, ($st) => getProbeViewType($st.probe.type, $st.probe.kind));

let key;

let width;

function handleBodySelectors(event) {
  const { selection, type } = event.detail;
  if (type === 'percentiles') store.setField('visiblePercentiles', selection);
  if (type === 'timeHorizon') store.setField('timeHorizon', selection);
  if (type === 'metricType') store.setField('proportionMetricType', selection);
  if (type === 'activeBuckets') {
    store.setField('activeBuckets', selection);
  }
}

</script>

<style>

h2 {
  margin: 0;
  margin-bottom: var(--space-4x);
  color: var(--cool-gray-600);
}

h2 span {
  font-weight: normal;
  color: var(--cool-gray-750)
}

.graphic-body__title--padding {
  padding-left: var(--space-4x);
  padding-right: var(--space-4x);
}

.graphic-body-container {
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-rows: auto auto;
  grid-template-areas: "header header";
  align-items: stretch;
  justify-items: stretch;
  --height: calc(100vh - var(--header-height) * 2);
}

.graphic-body__graphic-header {
  align-content: center;
  grid-area: header;
  display: grid;
  grid-template-columns: auto max-content;
  grid-column-gap: var(--space-4x);
  align-items: start;
  background-color: var(--cool-gray-100);
  min-height: var(--header-height);
  margin-left: var(--space-4x);
}

/* .graphic-body__graphic-header h2 {
  margin: 0;
  padding: 0;
  width: 100%;
  word-break: break-all;
  height: var(--space-6x);
  display: grid;
  align-items: center;
  padding-left: var(--space-4x);
} */

.graphic-body__content {
  box-sizing: border-box; 
  grid-area: content-body;
  min-height: var(--height);
  background-color: white;

  padding: var(--space-4x);
  padding-top: var(--space-2x);

  border-right: 2px solid var(--cool-gray-100);
  border-radius: var(--content-border-radius) 0 0 var(--content-border-radius);
}

.graphic-body__content--no-padding {
  padding-left:0;
  padding-right:0;
}

.graphic-body__details {
  grid-area: right;
  border-radius: 0 var(--content-border-radius) var(--content-border-radius) 0;
}

.graphic-body {
  height: 100%;
  display: grid;
  grid-template-areas: "content-body right";
  grid-template-columns: calc(var(--space-base) * 120) auto;
  box-shadow: var(--depth-large);
  border-radius: var(--content-border-radius);
}

.graphic-body > div:only-child {
  border-right: 0;
  border-radius: var(--content-border-radius);
  width: var(--main-content-width);
}

</style>

<svelte:window bind:innerWidth={width} />

<!-- <div class="graphic-body-container"> -->

    <!-- <div class="graphic-body__graphic-header">
      {#if $store.appView === 'PROBE'}
        <div transition:fly={{ x: -5, duration: 200 }}>
          <ProbeViewControl />
        </div>
      {/if}
    </div> -->

    <div class="graphic-body">
          {#if $store.appView === 'DEFAULT'}
          <div class="graphic-body__content">
              <DefaultBody />
          </div>
          {:else if $store.appView === 'PROBE'}
              {#await $dataset}
              <div class="graphic-body__content">
                  <Spinner size={48} color={'var(--cool-gray-400)'} />
              </div>
              {:then data}
                  {#if $store.probeView === 'explore'}
                    <div in:fade class="graphic-body__content">
                        {#if $temporaryViewTypeStore === 'categorical'}
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
                                aggregationLevel={$store.aggregationLevel}
                            >
                            <h2>explore / <span>{$store.probe.name}</span></h2>
                          </ProportionExplorerView>
                        {:else if ['histogram', 'scalar'].includes($temporaryViewTypeStore)}                    
                            <QuantileExplorerView markers={$firefoxVersionMarkers}
                                data={data.data}
                                probeType={$temporaryViewTypeStore}
                                timeHorizon={$store.timeHorizon}
                                percentiles={$store.visiblePercentiles}
                                on:selection={handleBodySelectors}
                                aggregationLevel={$store.aggregationLevel}
                            >
                            <h2>explore / <span>{$store.probe.name}</span></h2>
                          </QuantileExplorerView>
                        {:else}
                        <div  class="graphic-body__content">
                          <div style="width: 100%">
                            <Spinner size={48} color={'var(--cool-gray-400)'} />
                          </div>
                        </div>
                        {/if}
                    </div>
                  {:else if $store.probeView === 'table'} 
                  <div  class="graphic-body__content graphic-body__content--no-padding">
                    <div in:fade>
                    <!-- this conditional is a stopgap until we fix https://github.com/mozilla/glam/issues/206 -->
                    {#if $store.probe.type}
                      <ProbeTableView 
                        data={data.data}
                        probeType={$temporaryViewTypeStore}
                        colorMap={data.bucketColorMap}
                        visibleBuckets={[...$store.activeBuckets]}
                        aggregationLevel={$store.aggregationLevel}
                      >
                        <h2 class=graphic-body__title--padding>table / <span>{$store.probe.name}</span></h2>
                      </ProbeTableView>
                    {/if}
                    </div>
                  </div>
                  {/if}
              {:catch err}
              <div  class="graphic-body__content">
                <div in:fly={{ duration: 400, y: 10 }}>
                  <DataError reason={err.message} moreInformation={err.moreInformation} />
                </div>
              </div>
              {/await}
          {:else}
              <div>spinning</div>
          {/if}
          
      {#if $store.appView === 'PROBE'}
        <div class="graphic-body__details">
          <ProbeDetails />
        </div>
      {/if}

    </div>

<!-- </div> -->
