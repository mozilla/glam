<script>
import { setContext } from 'svelte';
import {
  byKeyAndAggregation,
} from '../../../utils/probe-utils';

import ProportionExplorerSmallMultiple from './ProportionExplorerSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';

export let data;
export let probeType;


const transformed = byKeyAndAggregation(data, 'proportion');

function getProportionKeys(tr) {
  return Object.keys(Object.values(Object.values(tr)[0])[0][0].counts);
}

let totalAggs = Object.keys(Object.values(transformed)[0]).length;

let timeHorizon = 'MONTH';
let percentiles = [5, 25, 50, 75, 95];

let proportions = getProportionKeys(transformed);

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

    <!-- <div class=body-control-row class:hidden={totalAggs === 1}>
      <InBodySelector bind:aggregationInfo={aggregationInfo} bind:currentAggregation={currentAggregation} aggregationTypes={aggregationTypes} />
    </div> -->

  <div class=data-graphics>
    {#each Object.entries(transformed) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon)}
          <div class='small-multiple'>
            <ProportionExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              proportions={proportions}
              timeHorizon={timeHorizon}
            />
          </div>
      {/each}
    {/each}
  </div>
</div>
