<script context=module>
const largestPercentile = writable(0);
</script>

<script>
import { writable, derived } from 'svelte/store';
import { slide } from 'svelte/transition';

export let data;
export let key;
export let resolution = 'ALL_TIME';
export let percentiles = [50];

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
import Line from '../../../src/components/data-graphics/LineMultiple.svelte';
import ComparisonSummary from '../../../src/components/data-graphics/ComparisonSummary.svelte';

import {
  buildIDToDate, firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../src/components/data-graphics/utils/build-id-utils';
import { extractPercentiles } from '../../../src/components/data-graphics/utils/percentiles';

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

$: $largestPercentile = Math.max(...data.map((d) => d.percentiles.find((di) => di.bin === 50).value), $largestPercentile);

let largestPercentileValue = 0;
largestPercentile.subscribe((lp) => { largestPercentileValue = lp; });

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

</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>


<div class=graphic-and-summary>
  <DataGraphic
    bind:margins={margins}
    bind:rollover={dgRollover}
    bind:xScale={xScale}
    bind:bodyHeight={H}
    bind:topPlot={T}
    key={key}
    data={data}
    xDomain={$domain}
    yDomain={[0, largestPercentileValue]}
    yType="numeric"
    width=550
    height=250
    bind:dataGraphicMounted={dataGraphicMounted}
  >
    <LeftAxis showBorder=true />
    <BottomAxis ticks={ticks} tickFormatter={tickFormatter} />

    <GraphicBody>
      {#each percentileData as
        [percentile, pi], i (pi)}
          <Line
          curve="curveStep"
          lineDrawAnimation={{ duration: 300 }} 
          xAccessor="label"
          yAccessor="originalPercentileValue"
          color={pi === 50 ? 'var(--digital-blue-400)' : 'var(--digital-blue-300)'}
          data={percentile} />
        {/each}
    </GraphicBody>

    {#if rollover.x && xScale && topPlot && bodyHeight}
      <rect x={xScale(rollover.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
     fill="var(--cool-gray-700)" opacity=.2 />
     <text 
      x={xScale(rollover.x)} 
      y={topPlot - margins.buffer}
      text-anchor='middle'
      font-family="var(--main-mono-font)"
      font-size='12'>
      <tspan fill="var(--cool-gray-500)" font-weight=bold>
        {rollover.datum.label.slice(0, 4)}-{rollover.datum.label.slice(4,
        6)}-{rollover.datum.label.slice(6, 8)}{' '}</tspan> 
      <tspan> {rollover.datum.label.slice(8, 10)}:</tspan>
      <tspan>{rollover.datum.label.slice(10, 12)}:</tspan>
      <tspan>{rollover.datum.label.slice(12, 14)}</tspan>
    </text>
    {/if}
  </DataGraphic>
  <ComparisonSummary 
    left={rollover.datum} 
    right={latest} 
    percentiles={percentiles} />
</div>
