<script>
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
  ]);

// //////////////////////////////////////////////////////////////////////////////

// import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
// import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
// import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
// import Line from '../../../src/components/data-graphics/LineMultiple.svelte';
// import { firstOfMonth, buildIDToMonth } from '../../../src/components/data-graphics/utils/build-id-utils';

// let domain = aggs[0][1].map((d) => d.label);
// function setDomain(str) {
//   if (str === 'WEEK') domain = aggs[0][1].slice(aggs[0][1].length - 7).map((d) => d.label);
//   if (str === 'MONTH') domain = aggs[0][1].slice(aggs[0][1].length - 30).map((d) => d.label);
//   if (str === 'ALL_TIME') domain = aggs[0][1].map((d) => d.label);
//   console.log(domain);
}
</script>

<div class=story>

<button on:click={() => { setDomain('WEEK'); }}>last week</button>
<button on:click={() => { setDomain('MONTH'); }}>last month</button>
<button on:click={() => { setDomain('ALL_TIME'); }}>all time</button>

{#each aggs as [aggType, dataset], i (aggType)}
  <h4>{aggType}</h4>
  <DataGraphic
    data={dataset}
    xDomain={domain}
    yDomain={[0, 1000]}
    yType="numeric"
    width=600
    height=150
  >
    <LeftAxis />
    <BottomAxis ticks={firstOfMonth} tickFormatter={buildIDToMonth} />
    <!-- <TopAxis ticks={firstOfMonth} tickFormatter={buildIDToMonth} />
    <RightAxis /> -->
    {#each extractPercentiles([50], dataset) as percentile, i}
      <Line
      curve="curveStep"
      lineDrawAnimation={{ duration: 400, delay: ((i + 1) % 2 === 0) * 400 }} 
      xAccessor="label"
      yAccessor="originalPercentileValue"
      color={i === 2 ? 'var(--digital-blue-500)' : 'var(--digital-blue-400)'}
      data={percentile} />
    {/each}
  </DataGraphic>
{/each}

</div>