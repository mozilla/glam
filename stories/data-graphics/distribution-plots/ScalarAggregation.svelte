<script>
import { writable } from 'svelte/store';

import { zipByAggregationType, makeDataset } from './shared';
import ACTIVE_TICKS_BUILD from '../../../tests/data/browser_engagement_active_ticks_build_id.json';

const activeTicksBuild = ACTIVE_TICKS_BUILD.response;
import { extractPercentiles } from '../../../src/components/data-graphics/utils/percentiles';

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

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
import Line from '../../../src/components/data-graphics/LineMultiple.svelte';
import Button from '../../../src/components/Button.svelte';
import { firstOfMonth, buildIDToMonth } from '../../../src/components/data-graphics/utils/build-id-utils';

let D = 'WEEK';
let domain = writable(aggs[0][1].map((d) => d.label));

function setDomain(str) {
  D = str;
  if (str === 'WEEK') domain.set(aggs[0][1].slice(aggs[0][1].length - 7).map((d) => d.label));
  if (str === 'MONTH') domain.set(aggs[0][1].slice(aggs[0][1].length - 30).map((d) => d.label));
  if (str === 'ALL_TIME') domain.set(aggs[0][1].map((d) => d.label));
}

let readableAggs = {
  avg: 'Average',
  min: 'Smallest Value (per client)',
  max: 'Largest Value (per client)',
  sum: 'Sum (per client)',
};

</script>

<style>
  h4 {
    margin-left: 50px;
  }

  .time-horizon {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: var(--space-base);
    width: max-content;
  }
</style>

<div class=story>

<div class=time-horizon>
  <!-- FIXME: this don't work. -->
  <Button compact level=medium on:click={() => { setDomain('WEEK'); }}>last week</Button>
  <Button compact level=medium on:click={() => { setDomain('MONTH'); }}>last month</Button>
  <Button compact level=medium on:click={() => { setDomain('ALL_TIME'); }}>all time</Button>
</div>
{#if $domain}
{#each aggs as [aggType, dataset], i (aggType + D)}
  <h4>{readableAggs[aggType]}</h4>
  <DataGraphic
    key={aggType + D}
    data={dataset}
    xDomain={$domain}
    yDomain={[0, 1000]}
    yType="numeric"
    width=600
    height=150
  >
    <LeftAxis />
    <BottomAxis ticks={firstOfMonth} tickFormatter={buildIDToMonth} />
      <GraphicBody>
      {#each extractPercentiles([50], dataset.filter((d) => $domain.includes(d.label))) as
      percentile, i (percentile)}
        <Line
        curve="curveStep"
        lineDrawAnimation={{ duration: 400, delay: ((i + 1) % 2 === 0) * 400 }} 
        xAccessor="label"
        yAccessor="originalPercentileValue"
        color={i === 2 ? 'var(--digital-blue-500)' : 'var(--digital-blue-400)'}
        data={percentile} />
      {/each}
    </GraphicBody>

  </DataGraphic>
{/each}
{/if}
</div>
