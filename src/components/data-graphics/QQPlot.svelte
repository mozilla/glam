<script>

// UTILITY FUNCTIONS THAT SHOULD BE MOVED TO ANOTHER FILE

function sortByKey(key) {
  return (a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  };
}

// ///////////////////////////////////////////////////////


import { fly } from 'svelte/transition';
import { setContext, getContext, onMount } from 'svelte';
import { writable, derived } from 'svelte/store';
import {
  line, curveStep,
} from 'd3-shape';
import { nearestBelow } from '../../utils/stats';

import DataGraphic from './DataGraphic.svelte';

import LeftAxis from './LeftAxis.svelte';
import BottomAxis from './BottomAxis.svelte';
import BoxPlot from './BoxPlotMultiple.svelte';
import Violin from './ViolinPlotMultiple.svelte';
import Line from './LineMultiple.svelte';

export let data = getContext('data');
export let aggregationLevel = 'version';

const PERCENTILES = [5, 25, 50, 75, 95];

// ///////////// DataGraphic.svelte //////////

export let margins = {
  left: 50,
  right: 50,
  top: 20,
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

export let width = getContext('width') || DEFAULTS.elementWidth * data.length + margins.left + margins.right;
export let height = getContext('height') || 300;
let bodyWidth = writable(width);

$: $bodyWidth = width - margins.left - margins.right;

let bodyHeight = writable(height - margins.top - margins.bottom);

setContext('bodyWidth', bodyWidth);
setContext('bodyHeight', bodyHeight);

// /////////////////////////////////////////////////////////////////////////

const getBins = (d) => d.map((obj) => obj.bin);
const getLabels = (ds) => ds.map((d) => d.label);

let xScale;
let yScale;

let connectQuantiles = line()
  .x((d) => xScale(d.label))
  .y((d) => yScale(d.value))
  .curve(curveStep);

const histogramValues = data.map((dataset) => {
  const histKeys = getBins(dataset.histogram);
  return {
    ...dataset,
    percentiles: dataset.percentiles
      .filter((p) => PERCENTILES.includes(p.bin))
      .map((p) => ({ ...p, value: nearestBelow(p.value, histKeys) })),
  };
});

const getHistogram = (label) => histogramValues.find((v) => v.label === label);

let rollover;
let rolloverValues = writable(undefined);

function initiateRollovers(rolloverStore) {
  if (rolloverStore === undefined) return;
  rolloverValues = derived(rolloverStore, ({
    x, y, py,
  }) => {
    let hoverBin;
    let hoverHistogram;
    let hoverPoint;
    let hoverPercentiles;
    const hoverKey = x;
    if (hoverKey) {
      hoverBin = y;
      const histogram = getHistogram(hoverKey);
      const { percentiles } = histogram;
      hoverHistogram = histogram.histogram;
      const dists = percentiles.map((p) => {
        const pi = { ...p };
        pi.dist = Math.abs(py - yScale(pi.value));
        return pi;
      });
      dists.sort(sortByKey('dist'));
      [hoverPoint] = dists;

      hoverPercentiles = histogramValues
        .map((h) => {
          const bin = h.percentiles.find((p) => p.bin === hoverPoint.bin);
          return { label: h.label, value: bin.value, percentile: bin.bin };
        });
      hoverPoint.x = hoverKey;
      return {
        x, hoverKey, hoverPoint, hoverPercentiles, hoverBin, hoverHistogram,
      };
    }
    return undefined;
  });
}

let mounted = false;

onMount(() => {
  mounted = true;
});

$: if (mounted) initiateRollovers(rollover);

</script>

{#if mounted}

<DataGraphic
  data={data}
  width={width}
  height={height}
  xDomain={getLabels(data)}
  yDomain={getBins(data[0].histogram)}
  xType="scalePoint"
  yType="scalePoint"
  bind:rollover={rollover}
  bind:xScale={xScale}
  bind:yScale={yScale}
>
    <!-- <g class=rollover-under>
        {#if $rolloverValues && $rolloverValues.hoverKey}
          <rect x={xScale($rolloverValues.hoverKey) - xScale.step() / 2} y={margins.top}
          width={xScale.step()} height={$bodyHeight} fill="var(--cool-gray-100)" />
        {/if}
        {#if $rolloverValues && $rolloverValues.hoverKey && aggregationLevel === 'build_id'}
          <Violin x={$rolloverValues.hoverKey} y={$rolloverValues.hoverHistogram} 
          valueAccessor="bin"
          densityAccessor="value"
          densityRange={[0, 30]} />
        {/if}
      </g> -->
  
      <LeftAxis every=8 /> 
      <BottomAxis />
      <g class=body>
          {#if aggregationLevel === 'build_id'}
            {#each histogramValues as {histogram, label}}
            <Violin x={label} y={histogram} 
            opacity={0.1}
            valueAccessor="bin"
            densityAccessor="value"
            densityRange={[0, 30]} />
            {/each}
            {#each PERCENTILES.map((p) => histogramValues.map((h) => ({
    label:
            h.label,
  perc: h.percentiles.find((pi) => +pi.bin === p).value,
  }))) as
            percentiles, i}
              <Line data={percentiles} xAccessor="label" yAccessor="perc" />
            {/each}
          {/if}
  
          {#if aggregationLevel !== 'build_id'}
          <g in:fly={DEFAULTS.flyParams} class=bars>
              {#each histogramValues as {histogram, label}, i (label)}
                <Violin opacity={($rolloverValues !== undefined && label
                  === $rolloverValues.hoverKey) ? 0.9 : 0.4} 
                  x={label} 
                  y={histogram}
                  areaColor="var(--digital-blue-400)"
                  valueAccessor="bin"
                  densityAccessor="value" />
              {/each}
            </g>
          <g class=box-plots>
            {#each histogramValues as {percentiles, label},
            i (label)}
                <BoxPlot 
                  lowest={percentiles[0].value}
                  lower={percentiles[1].value}
                  middle={percentiles[2].value}
                  higher={percentiles[3].value}
                  highest={percentiles[4].value}
                  x={label}
                  opacity={($rolloverValues && label === $rolloverValues.hoverKey) ? 1 : 0.6} />
            {/each}
          </g>
          {/if}
      </g>
  
      <g class=rollover-over>
        {#if $rolloverValues && $rolloverValues.hoverPoint}
          <path d={connectQuantiles($rolloverValues.hoverPercentiles) }
          stroke="var(--pantone-red-700)" opacity=.7 fill=none />
  
          <circle cx={xScale($rolloverValues.x)} cy={yScale($rolloverValues.hoverPoint.value)} r=3
          fill=blue />
          {#each $rolloverValues.hoverPercentiles as {label, value, percentile}, i (label)}
            <circle cx={xScale(label)} cy={yScale(value)} r=3
              fill="var(--pantone-red-500)" />
          {/each}
            <text 
                x={xScale($rolloverValues.hoverPercentiles[0].label) - margins.buffer * 2}
                y={yScale($rolloverValues.hoverPercentiles[0].value)}
                dy='.35em'
                text-anchor='end'
                font-size={DEFAULTS.axisTickFontSize + 1}
                fill='var(--pantone-red-500)'
              >
                {$rolloverValues.hoverPercentiles[0].percentile}%
              </text>
        {/if}
        {#if $rolloverValues && $rolloverValues.hoverBin}
            <rect 
              x={xScale($rolloverValues.hoverKey) - xScale.step() / 2} 
              y={yScale($rolloverValues.hoverBin) - yScale.step() / 2}
              width={xScale.step()} 
              height={yScale.step()} 
              fill='var(--blue-slate-600)' opacity=.3 />
            <text 
              x={xScale($rolloverValues.hoverKey) + xScale.step() / 2 + margins.buffer} 
              y={yScale($rolloverValues.hoverBin)}
              dy='.35em'
              font-size={DEFAULTS.axisTickFontSize}
            >{$rolloverValues.hoverBin}</text>
        {/if}
      </g>
</DataGraphic>
{/if}