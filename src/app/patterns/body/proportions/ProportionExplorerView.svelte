<script>
import { setContext } from 'svelte';
import {
  byKeyAndAggregation,
} from '../../../utils/probe-utils';

import ProportionExplorerSmallMultiple from './ProportionExplorerSmallMultiple.svelte';
import KeySelectionControl from '../../KeySelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';
import ProportionMetricTypeControl from '../../ProportionMetricTypeControl.svelte';

import { createCatColorMap } from '../../../../components/data-graphics/utils/color-maps';

export let data;
export let probeType;


let transformed = byKeyAndAggregation(data, 'proportion', 'build_id', { probeType }, { removeZeroes: probeType === 'histogram-enumerated' });

function getProportionKeys(tr) {
  return Object.keys(Object.values(Object.values(tr)[0])[0][0].counts);
}

let totalAggs = Object.keys(Object.values(transformed)[0]).length;

let timeHorizon = 'MONTH';
let metricType = 'proportions';

let latest = Object.values(Object.values(transformed)[0])[0];

// FIXME: slicing here for the demo.
[latest] = latest.slice(-2);

const sortOrder = (a, b) => {
  // get latest data point and see
  if (latest[metricType][a] < latest[metricType][b]) return 1;
  if (latest[metricType][a] >= latest[metricType][b]) return -1;
  return 0;
};

let options = getProportionKeys(transformed);
let cmpProportions = getProportionKeys(transformed);
cmpProportions.sort(sortOrder);

// I guess we can update the sort order when metricType changes,
// but obviously counts <-> proportions does not change the order
// for a build id's buckets.
$: if (metricType) cmpProportions.sort(sortOrder);

let proportions = getProportionKeys(transformed).filter((p) => cmpProportions.slice(0, 10).includes(p));

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
      <KeySelectionControl sortFunction={sortOrder} options={options} bind:selections={proportions} colorMap={cmp} />
    </div>
  </div>

  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>Metric Type</label>
      <ProportionMetricTypeControl bind:metricType={metricType} />
    </div>
  </div>

  <div class=data-graphics>
    {#each Object.entries(transformed) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon + probeType + metricType)}
          <div class='small-multiple'>
            <ProportionExplorerSmallMultiple
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              proportions={proportions}
              timeHorizon={timeHorizon}
              colorMap={cmp}
              metricType={metricType}
            />
          </div>
      {/each}
    {/each}
  </div>
</div>
