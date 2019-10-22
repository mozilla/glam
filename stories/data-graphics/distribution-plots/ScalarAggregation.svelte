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
import ButtonGroup from '../../../src/components/ButtonGroup.svelte';
import Button from '../../../src/components/Button.svelte';


let D = 'ALL_TIME';

function setDomain(str) { D = str; }

let readableAggs = {
  avg: 'Average',
  min: 'Smallest Value (per client)',
  max: 'Largest Value (per client)',
  sum: 'Sum (per client)',
};

let percentiles = [50];

function togglePercentile(p) {
  if (percentiles.includes(p)) percentiles = [...percentiles.filter((pi) => pi !== p)];
  else {
    percentiles = [...percentiles, p];
  }
  percentiles.sort();
  percentiles.reverse();
}

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
      <ButtonGroup>
        <Button toggled={D === 'WEEK'} compact level=medium on:click={() => { setDomain('WEEK'); }}>last week</Button>
        <Button toggled={D === 'MONTH'} compact level=medium on:click={() => { setDomain('MONTH'); }}>last month</Button>
        <Button toggled={D === 'ALL_TIME'} compact level=medium on:click={() => { setDomain('ALL_TIME'); }}>all
        time</Button>
      </ButtonGroup>
    </div>

    <div class=time-horizon>
      <ButtonGroup>
      {#each [5, 25, 50, 75, 95] as p, i (p)}
        <Button toggled={percentiles.includes(p)} compact level=low on:click={() => { togglePercentile(p); }}>{p}%</Button>
      {/each}
      </ButtonGroup>
    </div>

    {#each aggs as [aggType, dataset], i (aggType + D)}
      <h4>{readableAggs[aggType]}</h4>
      <ScalarAggregationMultiple
        data={dataset}
        key={aggType + D}
        resolution={D}
        percentiles={percentiles}
      />
    {/each}
    </div>
</div>