<script>
import { onMount } from 'svelte';
import { writable, derived } from 'svelte/store';

import { symbol, symbolStar as referenceSymbol } from 'd3-shape';

import DataGraphic from '../../../components/data-graphics/DataGraphic.svelte';
import LeftAxis from '../../../components/data-graphics/LeftAxis.svelte';
import BottomAxis from '../../../components/data-graphics/BottomAxis.svelte';
import GraphicBody from '../../../components/data-graphics/GraphicBody.svelte';
import BuildIDRollover from '../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../components/data-graphics/LineMultiple.svelte';

import {
  firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../components/data-graphics/utils/build-id-utils';

export let data;
export let metricKeys;
export let reference; // used to be latest
export let hovered = {};
export let key; // ???????
export let transform; // extractPercentiles?
export let lineColorMap = () => 'gray'; // percentileLineColorMap
export let strokeWidthMap = () => 1; // percentileLineStrokewidthMap
export let extractMouseoverValues;
export let xDomain;
export let yDomain;
export let yScaleType;
export let width;
export let height;
export let timeHorizon;

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

let transformedData = [];

$: transformedData = transform(metricKeys, data.filter((d) => xDomain.includes(d.label)))
  .map((ps, i) => [ps, metricKeys[i]]);


let xScale;
let yScale;
let H;
let T;
let bodyHeight;
let topPlot;
let dgRollover;

function initiateRollover(rolloverStore) {
  if (!rolloverStore) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    // we need the whole data point?
    // use only x to fetch the data point.
    const datum = data.find((d) => d.label === x);
    return { x, y, datum };
  }).subscribe((st) => {
    hovered = st;
  });
}

let dataGraphicMounted;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  H.subscribe((h) => { bodyHeight = h; });
}

</script>

 <DataGraphic
 data={data}
 xDomain={xDomain}
 yDomain={yDomain}
 yType={yScaleType}
 width={width}
 height={height}
 bind:rollover={dgRollover}
 bind:xScale={xScale}
 bind:yScale={yScale}
 bind:bodyHeight={H}
 bind:topPlot={T}
 right={16}
 key={key}
 bind:dataGraphicMounted={dataGraphicMounted}
 on:click={() => {
   if (hovered.datum) reference = hovered.datum;
 }}
>

{#if hovered.x && xScale && topPlot && bodyHeight}
<BuildIDRollover 
 x={hovered.x}
 label={hovered.datum.label}
/>
<rect x={xScale(hovered.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
fill="var(--cool-gray-100)" />
<rect x={xScale(reference.label) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
fill="var(--cool-gray-100)" />
{/if}
 <LeftAxis tickCount=6 />
 <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />

 <GraphicBody>
   {#each transformedData as
     [lineData, key], i (key)}
       <Line
       curve="curveStep"
       lineDrawAnimation={{ duration: 300 }} 
       xAccessor="label"
       yAccessor={'value'}
       strokeWidth={strokeWidthMap(key)}
       color={lineColorMap(key)}
       data={lineData} />
     {/each}
 </GraphicBody>

 {#if hovered.datum && extractMouseoverValues}
 {#each metricKeys.map((m) => extractMouseoverValues(m, hovered.datum)) as {label, bin, value}, i (bin)}
  <circle 
  cx={xScale(label)}
  cy={yScale(value)}
  r=2
  stroke="none"
  fill={lineColorMap(bin)}
  />

  {/each}
  {#each metricKeys.map((m) => extractMouseoverValues(m, reference)) as {label, bin, value}, i (bin)}
  <g style="transform:translate({xScale(label)}px, {yScale(value)}px)">
      <path 
        d={symbol().type(referenceSymbol).size(20)()} 
        fill={lineColorMap(bin)}
      />
    </g>
  {/each}
 {/if}
</DataGraphic>