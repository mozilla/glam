<script>
import { getContext } from 'svelte';
import { fade } from 'svelte/transition';
import { interpolateRdPu } from 'd3-scale-chromatic';
import { scaleLog, scaleLinear } from 'd3-scale';

export let data;

export let xAccessor = 'x';
export let yAccessor = 'y';
export let heatAccessor = 'heat';
export let scaleType = 'linear';
export let xScale = getContext('xScale');
export let yScale = getContext('yScale');
export let heatRange = [0.2, 0.8];

const scaleFunction = scaleType === 'linear' ? scaleLinear : scaleLog;

const heatValues = data.map((d) => d[heatAccessor]);
const heatCorrection = scaleType === 'linear' ? 0 : 1;
const scale = scaleFunction()
  .domain([
    Math.min(...heatValues) + heatCorrection,
    Math.max(...heatValues) + heatCorrection])
  .range(heatRange);

// for a single histogram, plot a row of values?
</script>
<g in:fade={{ duration: 600, delay: 400 }}>
  {#each data as datum, i}
    <rect 
      fill={interpolateRdPu(scale(datum[heatAccessor]))}
      x={xScale(datum[xAccessor]) + xScale.step() / 2}
      y={yScale(datum[yAccessor])}
      width={xScale.step()}
      height={yScale.step()}
    />
  {/each}
</g>