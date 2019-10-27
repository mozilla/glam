<script>
import { getContext } from 'svelte';
import { writable, derived } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { format } from 'd3-format';
import { symbol, symbolStar as referenceSymbol } from 'd3-shape';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../../components/data-graphics/LeftAxis.svelte';
import BuildIDRollover from '../../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../../components/data-graphics/LineMultiple.svelte';
import ComparisonSummary from '../../../../components/data-graphics/ComparisonSummary.svelte';
import DistributionComparison from '../rollovers/DistributionComparison.svelte';

import { percentileLineColorMap, percentileLineStrokewidthMap } from '../../../../components/data-graphics/utils/color-maps';
import {
  buildIDToDate, firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../../components/data-graphics/utils/build-id-utils';
import { extractPercentiles } from '../../../../components/data-graphics/utils/percentiles';

export let data;
export let title;
export let key;
export let timeHorizon;
export let percentiles = [50];

let valueFmt = format(',.4r');
let countFmt = format(',d');

const probeType = getContext('probeType');

let yScaleType;
let yDomain;
let whichPercentileVersion = 'transformedPercentile';
let whichPercentileVersionKey = 'transformedPercentiles';
if (probeType === 'histogram') {
  yScaleType = 'scalePoint';
  yDomain = data[0].histogram.map((d) => d.bin);
} else if (probeType === 'scalar') {
  yScaleType = 'log';
  let upperDomain = Math.max(...data.map((d) => d.percentiles[95]));
  yDomain = [0, upperDomain];
  whichPercentileVersion = 'percentile';
  whichPercentileVersionKey = 'percentiles';
}

// FIXME: after demo remove this requirement
data = data.slice(0, -1);

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

$: setDomain(timeHorizon);
let percentileData = [];

$: percentileData = extractPercentiles(percentiles, data.filter((d) => $domain.includes(d.label)))
  .map((ps, i) => [ps, percentiles[i]]);

// FIXME: establish the buildID graph as a shared pattern, not this boilerplate.
let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

$: if (timeHorizon === 'ALL_TIME') {
  tickFormatter = buildIDToMonth;
  ticks = firstOfMonth;
} else if (timeHorizon === 'MONTH') {
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
let topPlot;
let bodyHeight;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  H.subscribe((h) => { bodyHeight = h; });
}

// FIXME: this is for demo purposes. use better build data.
let latest = data[data.length - 1];
let fmt = format(',.2r');

// function tidyToObject(tidy) {
//   let out = {};
//   tidy.forEach((t) => {
//     out[`p${t.bin}`] = nearestBelow(t.value, latest.histogram.map((h) => h.bin));
//   });
//   return out;
// }


const movingAudienceSize = tweened(0, { duration: 500, easing });

$: movingAudienceSize.set(latest.audienceSize);


function getPercentiles(percentileBin, datum) {
  const percentile = datum.percentiles[percentileBin];
  const transformedPercentile = datum.transformedPercentiles[percentileBin];
  return { percentileBin, percentile, transformedPercentile };
}

function getAllPercentiles(percentileBins, datum) {
  return percentileBins.map((p) => getPercentiles(p, datum));
}

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
    <div class=bignum__label>⭑ Latest Median (50th perc.)</div>
    <div class=bignum__value>{valueFmt(latest.percentiles[50])}</div>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Audience Size</div>
    <div class=bignum__value>{countFmt($movingAudienceSize)}</div>
  </div>

</div>

<div class=graphic-and-summary>
  <DataGraphic
    data={data}
    xDomain={$domain}
    yDomain={yDomain}
    yType={yScaleType}
    width={WIDTH}
    height={HEIGHT}
    bind:dataGraphicMounted={dataGraphicMounted}
    bind:margins={margins}
    bind:rollover={dgRollover}
    bind:xScale={xScale}
    bind:yScale={yScale}
    bind:bodyHeight={H}
    bind:topPlot={T}
    right={16}
    key={key}
    on:click={() => {
      if (rollover.datum) latest = rollover.datum;
    }}
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
          yAccessor={whichPercentileVersion}
          strokeWidth={percentileLineStrokewidthMap(pi)}
          color={percentileLineColorMap(pi)}
          data={percentile} />
        {/each}
    </GraphicBody>

    {#if rollover.datum}
    {#each percentiles.map((p) => getPercentiles(p, rollover.datum)) as p, i (p.percentileBin)}
    <circle 
      cx={xScale(rollover.datum.label)}
      cy={yScale(p[whichPercentileVersion])}
      r=2
      stroke="none"
      fill={percentileLineColorMap(p.percentileBin)}
      />
      <g style="transform:translate({xScale(latest.label)}px, {yScale(latest[whichPercentileVersionKey][p.percentileBin])}px)">
          <path 
            d={symbol().type(referenceSymbol).size(20)()} 
            fill={percentileLineColorMap(p.percentileBin)}
          />
        </g>
      {/each}
  {/if}
  </DataGraphic>
  <DistributionComparison 
    yType={yScaleType}
    width={125}
    height={HEIGHT}
    leftDistribution={rollover.datum ? rollover.datum.histogram : undefined}
    rightDistribution={latest.histogram}
    leftLabel={rollover.x}
    rightLabel={latest.label}
    precentileValueAccessor={whichPercentileVersion}
    leftPercentiles={rollover.datum ? getAllPercentiles(percentiles, rollover.datum) : undefined}
    rightPercentiles={getAllPercentiles(percentiles, latest)}
    xDomain={['hovered', 'latest']}
    yDomain={yDomain}
    yFocus={rollover.y}
  />
  
  <ComparisonSummary 
    left={rollover.datum} 
    right={latest}
    leftLabel={rollover.x}
    rightLabel={latest.label}
    percentiles={percentiles} />
</div>
    