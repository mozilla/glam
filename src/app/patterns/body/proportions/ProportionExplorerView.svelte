<script>
import { setContext } from 'svelte';
import {
  gatherBy, prepareForProportionPlot, topKBuildsPerDay, sortByKey,
} from '../../../utils/probe-utils';

import QuantileExplorerSmallMultiple from '../quantiles/QuantileExplorerSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import InBodySelector from '../../AggregationTypeSelector.svelte';

export let data;
export let probeType;

function byKeyAndAggregation(d) {
  const byKey = gatherBy(data, (entry) => entry.key);
  Object.keys(byKey).forEach((k) => {
    byKey[k] = gatherBy(byKey[k], (entry) => entry.client_agg_type);
    Object.keys(byKey[k]).forEach((aggKey) => {
      byKey[k][aggKey] = prepareForProportionPlot(byKey[k][aggKey], 'build_id');
      byKey[k][aggKey] = topKBuildsPerDay(byKey[k][aggKey], 2);
      byKey[k][aggKey].sort(sortByKey('label'));
    });
  });
  return byKey;
}

const transformed = byKeyAndAggregation(data);

console.log(transformed);

let totalAggs = Object.keys(Object.values(transformed)[0]).length;

let timeHorizon = 'MONTH';
let percentiles = [5, 25, 50, 75, 95];
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
      <TimeHorizonControl bind:horizon={timeHorizon} />
    </div>
  
    <div class=body-control-set>
        <label class=body-control-set--label>Probe Value Percentiles</label>
      <PercentileSelectionControl bind:percentiles={percentiles} />
    </div>
  </div>

    <div class=body-control-row class:hidden={totalAggs === 1}>
      <InBodySelector bind:aggregationInfo={aggregationInfo} bind:currentAggregation={currentAggregation} aggregationTypes={aggregationTypes} />
    </div>

  <div class=data-graphics>
    {#each Object.entries(transformed) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon)}
        {#if Object.entries(aggs).length === 1 || aggType === currentAggregation}
          <div class='small-multiple'>
            <!-- <QuantileExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              percentiles={percentiles}
              timeHorizon={timeHorizon}
            /> -->
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</div>
