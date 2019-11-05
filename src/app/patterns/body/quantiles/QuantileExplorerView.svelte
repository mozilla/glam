<script>
import { setContext } from 'svelte';
import QuantileExplorerSmallMultiple from './QuantileExplorerSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import AggregationTypeSelector from '../../AggregationTypeSelector.svelte';

import {
  byKeyAndAggregation,
} from '../../../utils/probe-utils';


export let data;
export let probeType;
export let markers;

const transformed = byKeyAndAggregation(data);

let totalAggs = Object.keys(Object.values(transformed)[0]).length;

let timeHorizon = 'MONTH';
let percentiles = [95, 75, 50, 25, 5];
let aggregationTypes = ['avg', 'max', 'min', 'sum'];
let currentAggregation = aggregationTypes[0];
let aggregationInfo;

setContext('probeType', probeType);

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

  .hidden {
    visibility: hidden;
  }

</style>


<div class=body-content>
  
  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>Time Horizon  </label>
      <TimeHorizonControl bind:horizon={timeHorizon} />
    </div>
  
    <div class=body-control-set>
        <label class=body-control-set--label>Probe Value Percentiles</label>
      <PercentileSelectionControl bind:percentiles={percentiles} />
    </div>
  </div>

  {#if totalAggs > 1}
  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>aggregation</label>
      <AggregationTypeSelector bind:aggregationInfo={aggregationInfo} bind:currentAggregation={currentAggregation} aggregationTypes={aggregationTypes} />
    </div>    
  </div>
  {/if}



  <div class=data-graphics>
    {#each Object.entries(transformed) as [key, aggs], i (key)}  
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
