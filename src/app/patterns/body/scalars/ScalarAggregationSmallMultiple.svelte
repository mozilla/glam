<script context=module>
const largestPercentile = writable(0);
</script>

<script>
import { writable, derived } from 'svelte/store';

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
  grid-column-gap: var(--space-2x);
}
</style>


<div class=graphic-and-summary>
  <DataGraphic
    data={data}
    xDomain={$domain}
    yDomain={[0, largestPercentileValue]}
    yType="numeric"
    width=400
    height=150
    
    bind:dataGraphicMounted={dataGraphicMounted}
    bind:margins={margins}
    bind:rollover={dgRollover}
    bind:xScale={xScale}
    bind:bodyHeight={H}
    bind:topPlot={T}
    key={key}

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
      <BuildIDRollover 
        x={rollover.x}
        label={rollover.datum.label}
      />
      <rect x={xScale(rollover.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
      fill="var(--cool-gray-700)" opacity=.2 />
    {/if}
  </DataGraphic>
  <ComparisonSummary 
    left={rollover.datum} 
    right={latest} 
    percentiles={percentiles} />
</div>
