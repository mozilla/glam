<script>
import { writable } from 'svelte/store';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Point from 'udgl/data-graphics/elements/Point.svelte';
import MC from './MC.svelte';
import MultiLabel from './MultiLabel.svelte';

export let width = 800;
export let height = 250;
export let left = 50;
export let right = 50;
export let top = 35;
export let bottom = 25;

export let data;
export let title;
export let subtitle;
export let description;
export let xAccessor;
export let yAccessor;
export let xMin = data[0][xAccessor];
export let xMax = data[data.length - 1][xAccessor];
export let yMin = 0;
export let yMax;
export let yFormat = 'count';
export let markers = [];
export let colors = ['blue'];
export let areaColors = ['cornflowerblue'];
export let labels = [];
export let mouseOverFontSize = 13;

export let hoverPointFormat = yFormat;

export let area = false;

// axis controls
export let showXAxis = true;
export let showYAxis = true;
export let showXAxisLabels = true;
export let showYAxisLabels = true;
export let yAxisTickCount;
export let xAxisTickCount;

export let size = 'standard';

const xDomain = writable([xMin, xMax]);
$: $xDomain = [xMin, xMax];
export let hoverPoint = {};
</script>

<MC
  width={width}
  height={height}
  data={data}
  xAccessor={xAccessor}
  yAccessor={yAccessor}
  {yMin}
  {yMax}
  {xMin}
  {xMax}
  {showXAxis}
  {showYAxis}
  {showXAxisLabels}
  {showYAxisLabels}
  title={title}
  subtitle={subtitle}
  description={description}
  yFormat={yFormat}
  colors={colors}
  markers={markers}
  size={size}
  bind:hoverPoint
  {xAxisTickCount}
  {yAxisTickCount}
  top={top}
  bottom={bottom}
  left={left}
  right={right}
  hoverPointFormat={hoverPointFormat}
>
  <g slot=mc-body>
    {#each yAccessor as y, i}
    <Line 
        lineDrawAnimation={{ duration: 800 }} 
        data={data}
        color={colors[i] || 'blue'}
        xAccessor={xAccessor}
        yAccessor={y}
        area={area}
        areaColor={areaColors[i]}
      />
    {/each}
  </g>
  <g slot=mc-hoverpoint let:hoverPoint>
    {#if yAccessor.length > 1}
      <MultiLabel 
        point={hoverPoint}
        xAccessor={xAccessor}
        yAccessor={yAccessor}
        format={hoverPointFormat}
        colors={colors}
        labels={labels}
      />
    {/if}
    {#each yAccessor as y, i}
      <Point
        color={colors[i] || 'blue'}
        x={hoverPoint[xAccessor]} y={hoverPoint[y]} r={3} />
      />
  {/each}
  </g>
  <g slot=mc-annotation><slot name=annotation></slot></g>
</MC
>
