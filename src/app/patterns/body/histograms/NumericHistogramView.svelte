<script>

import NumericHistogramSmallMultiple from './NumericHistogramSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';

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

let timeHorizon = 'ALL_TIME';
let percentiles = [5, 25, 50, 75, 95];

</script>
  
  <style>
  

  
    .body-content {
      margin-top: var(--space-2x);
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
        <h4>{[aggType]}</h4>
        <div>
          <NumericHistogramSmallMultiple
            data={dataset}
            key={aggType + timeHorizon}
            resolution={timeHorizon}
            percentiles={percentiles}
          />
      </div>
      {/each}
    </div>
  </div>
  