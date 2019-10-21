<script context=module>
const largestPercentile = writable(0);
</script>

<script>
import { writable, derived } from 'svelte/store';

export let data;
export let key;
export let resolution = 'ALL_TIME';
export let percentiles = [50];

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
import Line from '../../../src/components/data-graphics/LineMultiple.svelte';

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

.summary {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: var(--space-2x);
}

.summary-percentiles {
  display: grid;
  grid-template-columns: max-content auto;
  grid-column-gap: var(--space-base);
  font-size: var(--text-01);
  align-content: start;
}

.summary-percentile--full {
  grid-column: 1 / 3;
}

.summary-percentile--bin {
  text-align: right;
  font-weight: bold;
  text-transform: uppercase;
}

.summary-percentile--value {
  justify-self: stretch;
  text-align: right;
  width: 100%;
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
    height=150
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


  <div class=summary style="padding-top:{margins ? margins.top : 0}">

    {#each [rollover.datum, latest] as focus, i}
      <div class=summary-percentiles>
        {#if focus}
          <div class='summary-percentile--full'>

              <span style="text-align: right;font-family: var(--main-mono-font); color: var(--cool-gray-500); font-weight: bold" >
                  {focus.label.slice(0, 4)}-{focus.label.slice(4,
                  6)}-{focus.label.slice(6, 8)}{' '}</span> 
                <span> {focus.label.slice(8, 10)}:</span>
                <span>{focus.label.slice(10, 12)}:</span>
                <span>{focus.label.slice(12, 14)}</span>
          </div>
          <div class=summary-percentile--bin>
              # profiles
            </div>
            <div class=summary-percentile--value>
              {focus.audienceSize}
            </div>
          {#each percentiles as percentile, i}
            <div class=summary-percentile--bin>
                {percentile}th %
              </div>
              <div class=summary-percentile--value>
                {focus.percentiles.find((p) => p.bin === percentile).value}
              </div>
          {/each}
        {/if}
      </div>
    {/each}
    <!-- {#if rollover.datum && xScale}
      <div class=summary-percentiles>
      {#each percentiles as percentile, i}
          <div class=summary-percentile--bin>
            {percentile}th %
          </div>
          <div class=summary-percentile--value>
            {rollover.datum.percentiles.find((p) => p.bin === percentile).value}
          </div>
      {/each}
      </div>
    {:else}
      <div class=percentile></div>
    {/if}
      <div class=summary-percentiles>
        {#each percentiles as percentile, i}
            <div class=summary-percentile--bin>
              {percentile}th %
            </div>
            <div class=summary-percentile--value>
              {latest.percentiles.find((p) => p.bin === percentile).value}
            </div>
        {/each}
        </div> -->
  </div>
</div>
