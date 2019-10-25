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

let timeHorizon = 'MONTH';
let percentiles = [5, 25, 50, 75, 95];

let readableAggs = {
  avg: 'Average',
  min: 'Smallest Value (per client)',
  max: 'Largest Value (per client)',
  sum: 'Sum (per client)',
};

</script>

<style>
.body-content {
  margin-top: var(--space-2x);
}

.data-graphics {
  margin-top: var(--space-4x);
}

.graphic-section {
  margin-bottom: var(--space-8x);
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

  <div class=data-graphics>
    {#each aggs as [aggType, dataset], i (aggType + timeHorizon)}
      <div class=graphic-section>
        <ScalarAggregationSmallMultiple
          title={readableAggs[aggType]}
          data={dataset}
          key={aggType + timeHorizon}
          resolution={timeHorizon}
          percentiles={percentiles}
        />
    </div>
    {/each}
  </div>
</div>
