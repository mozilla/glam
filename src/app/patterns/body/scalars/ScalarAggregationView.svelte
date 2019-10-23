<script>

import { zipByAggregationType, makeDataset, topKBuildsPerDay } from '../../../utils/probe-utils';

export let data;

const aggs = Object
  .entries(zipByAggregationType(data))
  .map(([aggType, payload]) => [
    aggType,
    makeDataset(payload, 'build_id'),
  ]).map(([aggType, dataset]) => {
    const newData = dataset.map((d) => {
      let { percentiles } = d;
      if (d.audienceSize < 10) {
        percentiles = percentiles.map((p) => ({ ...p, value: 0 }));
      }
      return { ...d, percentiles };
    });
    return [aggType, topKBuildsPerDay(newData)];
  });

import ScalarAggregationSmallMultiple from './ScalarAggregationSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';

let timeHorizon = 'ALL_TIME';
let percentiles = [50];

let readableAggs = {
  avg: 'Average',
  min: 'Smallest Value (per client)',
  max: 'Largest Value (per client)',
  sum: 'Sum (per client)',
};

</script>

<style>
  h4 {
    margin:0;
    margin-left: 50px;
    margin-top:50px;
  }

  .time-horizon {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: var(--space-base);
    width: max-content;
    margin-bottom: var(--space-base);
  }

  .body-content {
    margin-top: var(--space-4x);
  }

  /* .data-graphics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    
    grid-column-gap: var(--space-2x);
  } */

  /* @media (max-width: 1500px) {
    .data-graphics {
      grid-template-columns: auto;
    }
  } */
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

  <div class=data-graphics>
    {#each aggs as [aggType, dataset], i (aggType + timeHorizon)}
      <div>
        <h4>{readableAggs[aggType]}</h4>
        <ScalarAggregationSmallMultiple
          data={dataset}
          key={aggType + timeHorizon}
          resolution={timeHorizon}
          percentiles={percentiles}
        />
    </div>
    {/each}
  </div>
</div>
