<script>
import { setContext, getContext, createEventDispatcher } from 'svelte';
import QuantileExplorerSmallMultiple from './QuantileExplorerSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import AggregationTypeSelector from '../../AggregationTypeSelector.svelte';

const dispatch = createEventDispatcher();

export let store = getContext('store');
export let actions = getContext('actions');

export let data;
export let probeType;
export let markers;


let totalAggs = Object.keys(Object.values(data)[0]).length;

let aggregationTypes = ['avg', 'max', 'min', 'sum'];

// FIXME: these are selections that should be put in a level above this
export let timeHorizon = 'MONTH';
export let percentiles = [95, 75, 50, 25, 5];
let currentAggregation = aggregationTypes[0];

let aggregationInfo;

setContext('probeType', probeType);

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
    margin-top: var(--space-6x);
  }

  .small-multiple {
    margin-bottom: var(--space-8x);
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
        <label class=body-control-set--label>Probe Value Percentiles</label>
      <PercentileSelectionControl 
        percentiles={percentiles}
        on:selection={makeSelection('percentiles')}
        />
    </div>
  </div>

  {#if totalAggs > 1}
  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>aggregation</label>
      <AggregationTypeSelector 
        bind:aggregationInfo={aggregationInfo} 
        bind:currentAggregation={currentAggregation} 
        aggregationTypes={aggregationTypes}
        />
    </div>    
  </div>
  {/if}



  <div class=data-graphics>
    {#each Object.entries(data) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon)}
        {#if Object.entries(aggs).length === 1 || aggType === currentAggregation}
          <div class='small-multiple'>
            <QuantileExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              percentiles={percentiles}
              timeHorizon={timeHorizon}
              markers={markers}
            />
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</div>
