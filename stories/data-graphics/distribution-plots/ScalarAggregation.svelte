<script>

import { zipByAggregationType, makeDataset } from './shared';
import ACTIVE_TICKS_BUILD from '../../../tests/data/browser_engagement_active_ticks_build_id.json';

const activeTicksBuild = ACTIVE_TICKS_BUILD.response;

const aggs = Object
  .entries(zipByAggregationType(activeTicksBuild))
  .map(([aggType, payload]) => [
    aggType,
    makeDataset(payload, 'build_id'),
    payload,
  ]).map(([aggType, dataset, payload]) => {
    const newData = dataset.map((d) => {
      let { percentiles } = d;
      if (d.audienceSize < 3) {
        percentiles = percentiles.map((p) => ({ ...p, value: 0 }));
      }
      return { ...d, percentiles };
    });
    return [aggType, newData, payload];
  });

// //////////////////////////////////////////////////////////////////////////////

import ScalarAggregationMultiple from './ScalarAggregationMultiple.svelte';
import PercentileSelectionControl from '../../../src/app/patterns/PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../../src/app/patterns/TimeHorizonControl.svelte';

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
</style>

<div class=story>

  <h1 class="story__title">probe / <span class=probe-head>browser_engagement_active_ticks</span></h1>

  <div class=body-content>
    <div class=time-horizon>
      <TimeHorizonControl bind:horizon={timeHorizon} />
    </div>

    <div class=time-horizon>
      <PercentileSelectionControl bind:percentiles={percentiles} />
    </div>

    {#each aggs as [aggType, dataset], i (aggType + timeHorizon)}
      <h4>{readableAggs[aggType]}</h4>
      <ScalarAggregationMultiple
        data={dataset}
        key={aggType + timeHorizon}
        resolution={timeHorizon}
        percentiles={percentiles}
      />
    {/each}
    </div>
</div>