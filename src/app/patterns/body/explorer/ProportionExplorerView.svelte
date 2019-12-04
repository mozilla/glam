<script>
import { setContext, createEventDispatcher } from 'svelte';

import ProbeExplorer from './ProbeExplorer.svelte';
import KeySelectionControl from '../../KeySelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import ProportionMetricTypeControl from '../../ProportionMetricTypeControl.svelte';

import { formatPercent, formatCount } from '../utils/formatters';

export let aggregationLevel = 'build_id';
export let data;
export let probeType;
export let activeBuckets;
export let bucketColorMap;
export let bucketOptions;
export let timeHorizon = 'MONTH';
export let metricType = 'proportions';
export let bucketSortOrder = (a, b) => ((a < b) ? 1 : -1);

const dispatch = createEventDispatcher();

function makeSelection(type) {
  return function onSelection(event) {
    dispatch('selection', { selection: event.detail.selection, type });
  };
}

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
      {#if aggregationLevel === 'build_id'}
      <label class=body-control-set--label>Time Horizon  </label>
      <TimeHorizonControl 
        horizon={timeHorizon}
        on:selection={makeSelection('timeHorizon')}
      />
      {/if}
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
            <ProbeExplorer
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              activeBins={activeBuckets}
              timeHorizon={timeHorizon}
              binColorMap={bucketColorMap}
              metricType={metricType}
              showViolins={false}
              aggregationLevel={aggregationLevel}

              pointMetricType={metricType}
              
              
              yTickFormatter={metricType === 'proportions' ? formatPercent : formatCount}
              yScaleType={'linear'}
              
              yDomain={[0, Math.max(...data.map((d) => Object.values(d[metricType])).flat())]}
            />
          </div>
      {/each}
    {/each}
  </div>
</div>
