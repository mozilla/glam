<script>
import { zipByAggregationType, makeDataset } from '../../../src/app/utils/probe-utils';
import ACTIVE_TICKS_BUILD from '../../../tests/data/browser_engagement_active_ticks_build_id.json';

const activeTicksBuild = ACTIVE_TICKS_BUILD.response;

const aggs = Object
  .entries(zipByAggregationType(activeTicksBuild))
  .map(([aggType, payload]) => [
    aggType,
    makeDataset(payload, 'build_id'),
    payload,
  ]);
const dataset = aggs[1][1];

// //////////////////////////////////////////////////////////////////////////////

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
import RightAxis from '../../../src/components/data-graphics/RightAxis.svelte';
import TopAxis from '../../../src/components/data-graphics/TopAxis.svelte';
import { firstOfMonth, buildIDToMonth } from '../../../src/components/data-graphics/utils/build-id-utils';

let sides = {
  left: {
    all: true,
    ticks: true,
    labels: true,
    long: false,
    border: false,
  },
  bottom: {
    all: true,
    ticks: true,
    labels: true,
    long: false,
    border: false,
  },
  top: {
    all: false,
    ticks: true,
    labels: true,
    long: false,
    border: false,
  },
  right: {
    all: false,
    ticks: true,
    labels: true,
    long: false,
    border: false,
  },
};

</script>

<style>
h4 {
  margin:0;
  padding:0;
  margin-top: var(--space-4x);
}

td, th {
  padding-left: var(--space-2x);
  padding-right: var(--space-2x);
}

td input {
  width: 100%;
}

</style>

<div class=story>

<h1 class=story--title>Simple Axes</h1>

<table>
  <thead>
    <tr>
      <th></th>
      <th>All</th>
      <th>Ticks</th>
      <th>Labels</th>
      <th>Long</th>
      <th>Border</th>
    </tr>
  </thead>
  <tbody>
  {#each Object.entries(sides) as [sideName, values]}
    <tr>
      <td style='text-align:right;'>
        <b>{sideName}</b>
      </td>
      {#each Object.entries(values) as [valueName, value]}
        <td>
          <input type=checkbox bind:checked={sides[sideName][valueName]}>
        </td>
      {/each}
    </tr>
  {/each}
  </tbody>
</table>

<h4>long left / right</h4>
<DataGraphic
data={dataset}
xDomain={dataset.map((d) => d.label)}
yDomain={[0, 1000]}
yType="numeric"
width=500
height=250
>
  {#if sides.left.all}
    <LeftAxis 
      showLabels={sides.left.labels}
      showTicks={sides.left.ticks}
      showBorder={sides.left.border}
      lineStyle={sides.left.long ? 'long' : 'short'} />
  {/if}
  {#if sides.right.all}
    <RightAxis
      showLabels={sides.right.labels}
      showTicks={sides.right.ticks}
      showBorder={sides.right.border}
      lineStyle={sides.right.long ? 'long' : 'short'}
    />
  {/if}
  {#if sides.bottom.all}
    <BottomAxis 
      ticks={firstOfMonth} 
      tickFormatter={buildIDToMonth}
      showLabels={sides.bottom.labels}
      showTicks={sides.bottom.ticks}
      showBorder={sides.bottom.border}
      lineStyle={sides.bottom.long ? 'long' : 'short'}
    />
  {/if}
  {#if sides.top.all}
  <TopAxis 
    ticks={firstOfMonth} 
    tickFormatter={buildIDToMonth}
    showLabels={sides.top.labels}
    showTicks={sides.top.ticks}
    showBorder={sides.top.border}
    lineStyle={sides.top.long ? 'long' : 'short'}
  />
{/if}
</DataGraphic>


</div>