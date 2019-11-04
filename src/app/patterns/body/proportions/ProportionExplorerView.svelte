<script>
import { setContext } from 'svelte';
import {
  byKeyAndAggregation,
} from '../../../utils/probe-utils';

import ProportionExplorerSmallMultiple from './ProportionExplorerSmallMultiple.svelte';
import KeySelectionControl from '../../KeySelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';

import { createCatColorMap } from '../../../../components/data-graphics/utils/color-maps';

export let data;
export let probeType;


let transformed = byKeyAndAggregation(data, 'proportion', 'build_id', { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });


function getProportionKeys(tr) {
  return Object.keys(Object.values(Object.values(tr)[0])[0][0].counts);
}

let totalAggs = Object.keys(Object.values(transformed)[0]).length;

let timeHorizon = 'MONTH';

let latest = Object.values(Object.values(transformed)[0])[0];

// FIXME: slicing here for the demo.
[latest] = latest.slice(-2);

const sortOrder = (a, b) => {
  // get latest data point and see
  if (latest.counts[a] < latest.counts[b]) return 1;
  if (latest.counts[a] >= latest.counts[b]) return -1;
  return 0;
};

let proportions = getProportionKeys(transformed);
let cmpProportions = getProportionKeys(transformed);
cmpProportions.sort(sortOrder);

const cmp = createCatColorMap(cmpProportions);

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
        <label class=body-control-set--label>Keys</label>
        <KeySelectionControl sortFunction={sortOrder} bind:selections={proportions} colorMap={cmp} />
    </div>
  </div>

  <div class=data-graphics>
    {#each Object.entries(transformed) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon + probeType)}
          <div class='small-multiple'>
            <ProportionExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              proportions={proportions}
              timeHorizon={timeHorizon}
              colorMap={cmp}
            />
          </div>
      {/each}
    {/each}
  </div>
</div>
