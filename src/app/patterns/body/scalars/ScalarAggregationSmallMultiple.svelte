<script>
import { writable, derived } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { format } from 'd3-format';
import { symbol, symbolStar as referenceSymbol } from 'd3-shape';

let valueFmt = format(',.4r');
let countFmt = format(',d');
let pFmt = format('.0%');

export let data;

// FIXME: after demo remove this requirement
data = data.slice(0, -1);
export let title;
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

import DistributionComparison from '../rollovers/DistributionComparison.svelte';

import { percentileLineColorMap, percentileLineStrokewidthMap } from '../../../../components/data-graphics/utils/color-maps';
import { nearestBelow } from '../../../../utils/stats';
import { extractPercentiles } from '../../../../components/data-graphics/utils/percentiles';

import {
  buildIDToDate, firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../../components/data-graphics/utils/build-id-utils';

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

let [upperDomain] = extractPercentiles([95], data.filter((d) => $domain.includes(d.label)));
upperDomain = Math.max(...upperDomain.map((o) => o.originalPercentileValue));

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

let WIDTH = 450;
let HEIGHT = 350;

let margins;
let dataGraphicMounted = false;
let xScale;
let yScale;
let T;
let H;
let GW;
let R;
let graphicWidth;
let topPlot;
let rightPlot;
let bodyHeight;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  H.subscribe((h) => { bodyHeight = h; });
  R.subscribe((r) => { rightPlot = r; });
  GW.subscribe((gw) => { graphicWidth = gw; });
}

// FIXME: this is for demo purposes. use better build data.
let latest = data[data.length - 1];
let fmt = format(',.2r');


const movingAudienceSize = tweened(0, { duration: 500, easing });

$: movingAudienceSize.set(latest.audienceSize);
</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content max-content auto;
  /* grid-column-gap: var(--space-2x); */
}

table {
  border-spacing: 0px;
  font-size: 16px;
  /* justify-self: end; */
}

th {
  font-weight: 600;
}

td, th {
  font-size: 12px;
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
  /* width: max-content; */
  justify-content: end;
  font-size: 14px;
}

.summary-miniature {
  display:grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  outline:1px solid black;
}

h4 {
  padding: 0px;
  margin:0px;
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.title-and-summary {
  display:grid;
  grid-template-columns: auto max-content max-content;
  grid-column-gap: var(--space-4x);
  justify-items: start;
  margin-bottom: var(--space-4x);
}

.bignum {
  width: max-content;
  justify-self: end;
}

.bignum__label {
  font-size: var(--text-015);
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.bignum__value {
  font-size: var(--text-06);
  text-align: right;
}
</style>


<div class='title-and-summary'>
  <div style="padding-left:{margins ? margins.left : 0}px;">
    <h4>{title}</h4>
  </div>
  <div class=bignum>
    <div class=bignum__label>Latest Median (50th perc.)</div>
    <div class=bignum__value>{valueFmt(latest.percentiles.find((p) => p.bin === 50).value)}</div>
  </div>
  <div class=bignum>
    <div class=bignum__label>Affected Clients</div>
    <div class=bignum__value>{countFmt($movingAudienceSize)}</div>
  </div>

</div>

<div class=graphic-and-summary>
  <DataGraphic
    data={data}
    xDomain={$domain}
    yDomain={[0, upperDomain]}
    yType="log"
    width={WIDTH}
    height={HEIGHT}
    bind:dataGraphicMounted={dataGraphicMounted}
    bind:margins={margins}
    bind:rollover={dgRollover}
    bind:xScale={xScale}
    bind:yScale={yScale}
    bind:bodyHeight={H}
    bind:topPlot={T}
    bind:graphicWidth={GW}
    bind:rightPlot={R}
    right={16}
    key={key}

  >

  {#if rollover.x && xScale && topPlot && bodyHeight}
  <BuildIDRollover 
    x={rollover.x}
    label={rollover.datum.label}
  />
  <rect x={xScale(rollover.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
  fill="var(--cool-gray-100)" />
  <rect x={xScale(latest.label) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
  fill="var(--cool-gray-100)" />
{/if}
    <LeftAxis tickCount=6 />
    <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />

    <GraphicBody>
      {#each percentileData as
        [percentile, pi], i (pi)}
          <Line
          curve="curveStep"
          lineDrawAnimation={{ duration: 300 }} 
          xAccessor="label"
          yAccessor="originalPercentileValue"
          strokeWidth={percentileLineStrokewidthMap(pi)}
          color={percentileLineColorMap(pi)}
          data={percentile} />
        {/each}
        {#if rollover.datum}
          {#each rollover.datum.percentiles as percentile, i}
          {#if percentiles.includes(percentile.bin)}
          <circle 
            cx={xScale(rollover.datum.label)}
            cy={yScale(percentile.value)}
            r=2
            stroke="none"
            fill={percentileLineColorMap(percentile.bin)}
            />
            <g style="transform:translate({xScale(latest.label)}px, {yScale(latest.percentiles[i].value)}px)">
                <path 
                  d={symbol().type(referenceSymbol).size(20)()} 
                  fill={percentileLineColorMap(latest.percentiles[i].bin)}
                />
              </g>
            {/if}
            {/each}
        {/if}
    </GraphicBody>


  </DataGraphic>
  <DistributionComparison 
    width={125}
    height={HEIGHT}
    yType="log"
    yAccessor={'value'}
    leftDistribution={rollover.datum ? rollover.datum.histogram : undefined}
    leftLabel={rollover.x}
    rightDistribution={latest.histogram}
    rightLabel={latest.label}
    leftPercentiles={rollover.datum ? rollover.datum.percentiles.filter((p) => percentiles.includes(p.bin)) : undefined}
    rightPercentiles={latest.percentiles.filter((p) => percentiles.includes(p.bin))}
    xDomain={['hovered', 'latest']}
    yDomain={[0, upperDomain]}
    yFocus={rollover.y}
  />
  <ComparisonSummary 
    left={rollover.datum} 
    right={latest}
    yAccessor={'originalPercentileValue'}
    leftLabel={rollover.x}
    rightLabel={latest.label}
    percentiles={percentiles} />
</div>
    