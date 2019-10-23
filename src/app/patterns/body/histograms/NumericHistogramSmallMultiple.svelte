<script>
import { writable, derived } from 'svelte/store';
import { format } from 'd3-format';

export let data;
export let key;
export let resolution = 'ALL_TIME';
export let percentiles = [50];

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../../components/data-graphics/LeftAxis.svelte';
import BuildIDRollover from '../../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../../components/data-graphics/LineMultiple.svelte';
import ComparisonSummary from '../../../../components/data-graphics/ComparisonSummary.svelte';

import { percentileLineColorMap, percentileLineStrokewidthMap } from '../../../../components/data-graphics/utils/color-maps';

import {
  buildIDToDate, firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../../components/data-graphics/utils/build-id-utils';
import { extractPercentiles } from '../../../../components/data-graphics/utils/percentiles';

let domain = writable(data.map((d) => d.label));

function setDomain(str) {
  const start = buildIDToDate(data[data.length - 1].label);
  let filtered = data;
  let daysAgo = str === 'WEEK' ? 7 : 30;
  if (str !== 'ALL_TIME') {
    start.setDate(start.getDate() - daysAgo);
    filtered = data.filter((d) => buildIDToDate(d.label) >= start);
  }
  domain.set(filtered.map((d) => d.label));
}

$: setDomain(resolution);
let percentileData = [];

$: percentileData = extractPercentiles(percentiles, data.filter((d) => $domain.includes(d.label)))
  .map((ps, i) => [ps, percentiles[i]]);


// let [upperDomain] = extractPercentiles([95], data.filter((d) => $domain.includes(d.label)));
// upperDomain = Math.max(...upperDomain.map((o) => o.originalPercentileValue));

let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

$: if (resolution === 'ALL_TIME') {
  tickFormatter = buildIDToMonth;
  ticks = firstOfMonth;
} else if (resolution === 'MONTH') {
  tickFormatter = buildIDToMonth;
  ticks = mondays;
} else {
  tickFormatter = buildIDToMonth;
  ticks = getFirstBuildOfDays;
}

let dgRollover;
let rollover = {};
function initiateRollover(rolloverStore) {
  if (!rolloverStore) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    // we need the whole data point?
    // use only x to fetch the data point.
    const datum = data.find((d) => d.label === x);
    return { x, y, datum };
  }).subscribe((st) => {
    rollover = st;
  });
}

let margins;
let dataGraphicMounted = false;
let xScale;
let T;
let H;
let topPlot;
let bodyHeight;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  H.subscribe((h) => { bodyHeight = h; });
}

let latest = data[data.length - 1];
let fmt = format(',.2r');
</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content auto;
  grid-column-gap: var(--space-2x);
}

table {
  border-spacing: 0px;
}

th {
  font-weight: 600;
}

td, th {
  font-size: 11px;
  text-align: right;
  min-width: var(--space-6x);
}

.color-label {
  display:inline-block;
  width: var(--space-base);
  height: var(--space-base);
  margin-right: var(--space-1h);
  border-radius: var(--space-1q);
}

.bold {
  font-weight: bold;
}

.summary {
  display:grid;
  grid-auto-flow:column;
  width: max-content;
  font-size: 11px;
}

.summary-miniature {
  display:grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  outline:1px solid black;
}

</style>

<!-- <table>
  <thead>
    <tr>
        <th></th>
        {#each percentiles as perc, i}
          <th><span class=color-label style='background-color:{percentileLineColorMap(perc)}'></span>{perc}%</th>
        {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>latest</td>
    {#each percentiles as perc, i}
      <td class:bold={perc === 50}>{fmt(latest.percentiles.find((pi) => pi.bin === perc).value)}</td>
    {/each}
    </tr>
    <tr>
    <td>hovered</td>
    {#if rollover.datum}
    {#each percentiles as perc, i}
      <td class:bold={perc === 50}>{fmt(rollover.datum.percentiles.find((pi) => pi.bin === perc).value)}</td>
    {/each}
    {/if}
    </tr>
  </tbody>
</table> -->

<!-- <div class=summary>
  {#each percentiles as perc, i}
    <div class=summary-miniature>
      <div><span class=color-label
      style='background-color:{percentileLineColorMap(perc)}'
      ></span>{perc}%</div>
      <div>
        {fmt(latest.percentiles.find((pi) => pi.bin === perc).value)}
      </div>
      <div></div>
      <div>
        {#if rollover.datum}
          {fmt(rollover.datum.percentiles.find((pi) => pi.bin === perc).value)}
        {/if}
      </div>
    </div>
  {/each}
</div> -->

<div class=graphic-and-summary>
  <DataGraphic
    data={data}
    xDomain={$domain}
    yDomain={data[0].histogram.map((d) => d.bin)}
    yType="scalePoint"
    width=600
    height=350
    bind:dataGraphicMounted={dataGraphicMounted}
    bind:margins={margins}
    bind:rollover={dgRollover}
    bind:xScale={xScale}
    bind:bodyHeight={H}
    bind:topPlot={T}
    key={key}

  >
    <LeftAxis />
    <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />

    <GraphicBody>
      {#each percentileData as
        [percentile, pi], i (pi)}
          <Line
          curve="curveStep"
          lineDrawAnimation={{ duration: 300 }} 
          xAccessor="label"
          yAccessor="value"
          strokeWidth={percentileLineStrokewidthMap(pi)}
          color={percentileLineColorMap(pi)}
          data={percentile} />
        {/each}
    </GraphicBody>

    {#if rollover.x && xScale && topPlot && bodyHeight}
      <BuildIDRollover 
        x={rollover.x}
        label={rollover.datum.label}
      />
      <rect x={xScale(rollover.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
      fill="var(--cool-gray-700)" opacity=.2 />
    {/if}
  </DataGraphic>
  <!-- <ComparisonSummary 
    left={rollover.datum} 
    right={latest} 
    percentiles={percentiles} /> -->
</div>
    