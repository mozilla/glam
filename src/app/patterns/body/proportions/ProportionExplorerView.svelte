<script>
import { setContext, createEventDispatcher, onMount } from 'svelte';

import ProportionExplorerSmallMultiple from './ProportionExplorerSmallMultiple.svelte';
import KeySelectionControl from '../../KeySelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import ProportionMetricTypeControl from '../../ProportionMetricTypeControl.svelte';

export let data;
export let probeType;
export let activeBuckets;
export let bucketColorMap;
export let bucketOptions;
export let bucketSortOrder = (a, b) => ((a < b) ? 1 : -1);

const dispatch = createEventDispatcher();

function makeSelection(type) {
  return function onSelection(event) {
    dispatch('selection', { selection: event.detail.selection, type });
  };
}

// let transformed = byKeyAndAggregation(data, 'proportion', 'build_id', { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });

let totalAggs = Object.keys(Object.values(data)[0]).length;

export let timeHorizon = 'MONTH';
export let metricType = 'proportions';

let latest = Object.values(Object.values(data)[0])[0];

// FIXME: slicing here for the demo.
[latest] = latest.slice(-1);

setContext('probeType', probeType);

</script>

<style>
  .body-content {
    margin-top: var(--space-2x);
  }

  .data-graphics {
    margin-top: var(--space-8x);
  }

  .small-multiple {
    margin-bottom: var(--space-8x);
  }

  .hidden {
    visibility: hidden;
  }

</style>


<div class=body-content>
  
  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>Time Horizon  </label>
      <TimeHorizonControl 
        horizon={timeHorizon}
        on:selection={makeSelection('timeHorizon')}
      />
    </div>
  
    <div class=body-control-set>
      <label class=body-control-set--label>Categories</label>
        <KeySelectionControl 
          sortFunction={bucketSortOrder} 
          options={bucketOptions} 
          selections={activeBuckets} 
          on:selection={makeSelection('activeBuckets')}
          colorMap={bucketColorMap} />
    </div>
  </div>

  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>Metric Type</label>
      <ProportionMetricTypeControl 
        metricType={metricType}
        on:selection={makeSelection('metricType')}
      />
    </div>
  </div>

  <div class=data-graphics>
    {#each Object.entries(data) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon + probeType + metricType)}
          <div class='small-multiple'>
            <ProportionExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              activeBuckets={activeBuckets}
              timeHorizon={timeHorizon}
              colorMap={bucketColorMap}
              metricType={metricType}
            />
          </div>
      {/each}
    {/each}
  </div>
</div>
