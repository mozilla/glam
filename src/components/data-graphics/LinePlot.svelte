<script>
import { setContext, getContext, onMount } from 'svelte';
import { writable, derived } from 'svelte/store';
import { nearestBelow } from '../../utils/stats';
import { extractPercentiles } from './utils/percentiles';

import DataGraphic from './DataGraphic.svelte';

import LeftAxis from './LeftAxis.svelte';
import BottomAxis from './BottomAxis.svelte';
import Line from './LineMultiple.svelte';
import Heatmap from './Heatmap.svelte';
import Violin from './ViolinPlotMultiple.svelte';

import {
  dateToBuildID, firstOfMonth, getFirstBuildOfDays, mondays,
  buildIDToMonth,
} from './utils/build-id-utils';

import { telemetryHistogramToHeatmap } from './utils/histograms';

export let data;


const PERCENTILES = [5, 25, 50, 75, 95];

// ///////////// DataGraphic.svelte //////////

export let margins = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 20,
  laneGap: 30,
  buffer: 5,
};

const DEFAULTS = {
  elementWidth: 60,
  axisTickFontSize: 10,
  flyParams: { y: 10, duration: 300 },
  fadeParams: { duration: 300 },
};

setContext('defaults', DEFAULTS);
setContext('margins', margins);

export let width = getContext('width') || Math.min(DEFAULTS.elementWidth * data.length + margins.left + margins.right, 800);
export let height = getContext('height') || 300;
export let units = 'ms';

let bodyHeight = writable(0); // eslint-disable-line
let bodyWidth = writable(0); // eslint-disable-line

// /////////////////////////////////////////////////////////////////////////

const getHistogram = (label) => data.find((v) => v.label === label);

const percentiles = extractPercentiles(PERCENTILES, data);

let rollover;
let rolloverValues = writable(undefined);

function initiateRollovers(rolloverStore) {
  if (rolloverStore === undefined) return;
  rolloverValues = derived(rolloverStore, ($st) => {
    const { x, y } = $st;
    // get all values of x for all percentiles.
    // get the hist for x
    const hist = getHistogram(x);
    if (!hist) return undefined;
    const histKeys = hist.histogram.map((h) => h.bin);
    const toNearest = hist.percentiles
      .map((p) => ({ ...p, value: nearestBelow(p.value, histKeys) }));
    return {
      x, y, percentiles: toNearest, histogram: hist.histogram,
    };
  });
}


let xScale;
let yScale;
let dataGraphicMounted;
let mounted = false;

let rightPlot;
let topPlot;
let bottomPlot;

let rpValue = 0;
let tpValue = 0;
let btValue = 0;

onMount(() => {
  mounted = true;
});

$: if (dataGraphicMounted) {
  initiateRollovers(rollover);
  rightPlot.subscribe((rp) => {
    rpValue = rp;
  });
  topPlot.subscribe((rp) => {
    tpValue = rp;
  });
  bottomPlot.subscribe((bp) => {
    btValue = bp;
  });
}


let last = Infinity;
let xDomain = data.map((d) => d.label);

let showHeatmap = false;

</script>

{#if mounted}

<!-- <DataGraphic
  data={data}
  xDomain={data.map((d) => d.label)}
>
  <g>

  </g>
</DataGraphic> -->
<div style='margin-top: var(--space-4x)'>
  <div style='margin-left: 100px;'>
    <input type=checkbox bind:checked={showHeatmap} /> heatmap
  </div>
</div>

<DataGraphic
    width={width}
    height={height}
    data={data} 
    xDomain={data.map((d) => d.label)}
    yDomain={data[0].histogram.map((h) => h.bin)}
    xType="scalePoint"
    yType="scalePoint"

    bind:rightPlot={rightPlot}
    bind:topPlot={topPlot}
    bind:bottomPlot={bottomPlot}
    bind:xScale={xScale}
    bind:yScale={yScale}
    bind:rollover={rollover}
    bind:dataGraphicMounted={dataGraphicMounted}
  >

  {#if showHeatmap}
    <Heatmap data={telemetryHistogramToHeatmap(data)} scaleType='log'
    heatRange={[0.1, 0.7]} />
  {/if}
  <LeftAxis tickCount={4} />
  <!-- {#if dataGraphicMounted} -->
  <!-- <g>
    {#each firstOfMonth(xScale) as tick, i}
      <text x={xScale(tick)} y={btValue}>{buildIDToMonth(tick)}</text>
    {/each}
  </g>
  {/if} -->
  <BottomAxis ticks={firstOfMonth(xScale)} tickFormatter={buildIDToMonth} />
  {#if dataGraphicMounted && $rolloverValues}
    <g class=rollover-body-under>
      <rect 
        x={xScale($rolloverValues.x) - xScale.step() / 2}
        y={margins.top}
        width={xScale.step()}
        height={height - margins.bottom - margins.top}
        fill="var(--cool-gray-700)"
        opacity=.15
      />
    </g>
  {/if}

  <g class=graphic-body>
      {#each percentiles as percentile, i}
        <Line
          curve="curveStep"
          lineDrawAnimation={{ duration: 400, delay: ((i + 1) % 2 === 0) * 400 }} 
          xAccessor="label"
          yAccessor="value"
          strokeWidth={i === 2 ? 2 : 1}
          color={i === 2 ? 'var(--digital-blue-500)' : 'var(--digital-blue-400)'}
           data={percentile} />

           <!-- {#if dataGraphicMounted}
            <g transform="translate({xScale(percentile[percentile.length
            - 1].label) + margins.buffer}, {yScale(percentile[percentile.length
              - 1].value)})"
            dy=".35em">
                <text
                font-size="10.5px"
                fill="var(--cool-gray-500)"
                dy=".35em">{percentile[percentile.length - 1].value}</text>
              <text 
                dy='.35em'
                dx="24px"
                font-weight={i === 2 ? 'bold' : 'normal'}
                font-size="10.5px"
                fill="var(--pantone-red-500)"
              >{PERCENTILES[i]}%</text>
            </g>
         {/if} -->

      {/each}
  </g>
  {#if dataGraphicMounted && $rolloverValues}
    <g class=rollover-body>
        <!-- rollover circles -->
        <!-- {#if $rolloverValues}
          {#each $rolloverValues.percentiles as perc, i}
            <circle cx={xScale($rolloverValues.x)} cy={yScale(perc.value)} r=3 fill=red />
          {/each}
        {/if} -->
    </g>
    <g class='rollover-top-margin' style="transform: translate({rpValue}px,
    {tpValue / 2}px);">
      <text text-anchor='end' x=0 y=0  font-size=12>
        {#each $rolloverValues.percentiles as perc, i}
          <tspan fill="var(--pantone-red-500)" font-size=11
            > {'  '} {perc.bin}%</tspan> {'    '}
          <tspan font-weight=500 fill="var(--cool-gray-500)">{perc.value}{i
          === 0 ? units : '  '} {'   '}     </tspan>
        {/each}
      </text>
    </g>
    {#if $rolloverValues.histogram}
    <g transform="translate({-8} 0)" opacity=.9>
    <Violin 
      showLeft={false}
      x={$rolloverValues.x}
      y={$rolloverValues.histogram} 
      densityAccessor='value'
      valueAccessor='bin'
      densityRange={[0, 30]}
      areaColor="var(--digital-blue-400)"
      lineColor="var(--digital-blue-500)"
      />
    </g>
  {/if}
  {/if}
  
</DataGraphic>
{/if}