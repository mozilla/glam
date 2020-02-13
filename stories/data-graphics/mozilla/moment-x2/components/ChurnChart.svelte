<script>

import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { fade } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';
import { stack, stackOffsetNone } from 'd3-shape';

import MC from './MC.svelte';
import MultiLabel from './MultiLabel.svelte';

export let title = 'churn';
export let subtitle;
export let description = 'ok';
export let width = 1104;
export let height = 350;
export let data;
export let xAccessor = 'date';
export let yPositiveAccessor = []; // each yAccessor is part of the stack.
export let yNegativeAccessor = [];
export let yPositiveColors = [];
export let yNegativeColors = [];
export let yPositiveLabels = [];
export let yNegativeLabels = [];
export let markers = [];
export let hoverPoint = {};

export let xMin = data[0][xAccessor];
export let xMax = data[data.length - 1][xAccessor];

export let hovered = false;

let maxY = Math.max(...data.map((d) => yPositiveAccessor.map((y) => d[y]).reduce((a, b) => a + b, 0)));
let minY = -maxY;

export let colors = [];
const xDomain = writable([xMin, xMax]);
$: $xDomain = [xMin, xMax];
const inflator = tweened(0, { duration: 1000, easing });
$: inflator.set(1);

$: $xDomain = [xMin, xMax];

const S = stack().keys(yPositiveAccessor).offset(stackOffsetNone);
const N = stack().keys(yNegativeAccessor).offset(stackOffsetNone);

function getPositives(ds) {
  return S(ds).map((d, i) => d
    .map((di, j) => ({
      y0: di[0], y1: di[1], [xAccessor]: data[j][xAccessor], yValue: ds[j][yPositiveAccessor[i]],
    })));
}

function getNegatives(ds) {
  return N(ds).map((d, i) => d
    .map((di, j) => ({
      y0: -di[0], y1: -di[1], [xAccessor]: data[j][xAccessor], yValue: ds[j][yNegativeAccessor[i]],
    })));
}

function makeHover(pos, neg, x) {
  // index for pos, index for neg in yPositiveWAccessor, yNegativeAccessor
  const out = { [xAccessor]: x };
  yPositiveAccessor.forEach((y, i) => {
    out[y] = pos[i][0].y1;
    out[`${y}Value`] = pos[i][0].yValue;
  });
  yNegativeAccessor.forEach((y, i) => {
    out[y] = neg[i][0].y1;
    out[`${y}Value`] = neg[i][0].yValue;
  });
  return out;
}

const positivePoints = getPositives(data);
const negativePoints = getNegatives(data);

</script>

<MC
  width={width}
  height={height}
  data={data}
  xAccessor={xAccessor}
  yAccessor={[...yPositiveAccessor, ...yNegativeAccessor]}
  title={title}
  subtitle={subtitle}
  description={description}
  yFormat={'count'}
  {xMin}
  {xMax}
  yDomain={[minY, maxY * 1.5]}
  colors={[...yPositiveColors, ...yNegativeColors]}
  markers={markers}
  bind:hoverPoint
  bind:hovered
>
  <g slot=mc-body let:xScale let:yScale let:left let:right>
    {#each positivePoints as yi, i}
      {#each yi as dj, j}
        <rect 
          x={xScale(dj[xAccessor])}
          y={$inflator * yScale(dj.y1) + (1 - $inflator) * yScale(0)}
          height={((yScale(dj.y0) - yScale(dj.y1))) * $inflator}
          width={6}
          fill={yPositiveColors[i] || 'cornflowerblue'}
          opacity={(hovered && dj[xAccessor] !== hoverPoint[xAccessor]) ? 0.5 : 1}
        />
      {/each}
    {/each}

    {#each negativePoints as yi, i}
      {#each yi as dj, j}
        <rect 
          x={xScale(dj[xAccessor])}
          y={$inflator * yScale(dj.y0) + (1 - $inflator) * yScale(0)}
          height={((yScale(dj.y1) - yScale(dj.y0))) * $inflator}
          width={6}
          fill={yNegativeColors[i] || 'salmon'}
          opacity={(hovered && dj[xAccessor] !== hoverPoint[xAccessor]) ? 0.5 : 1}

        />
      {/each}
  {/each}
    <line x1={left} x2={right} y1={yScale(0)} y2={yScale(0)} stroke=black />
  </g>
  <g slot=mc-hoverpoint>
    <g in:fade={{ duration: 1000 }}>
      <MultiLabel
        xOffset={5}
        point={makeHover(getPositives([hoverPoint]), getNegatives([hoverPoint]), hoverPoint[xAccessor])}
        xAccessor={xAccessor}
        yAccessor={[...yPositiveAccessor, ...yNegativeAccessor]}
        yValueAccessor={[...yPositiveAccessor.map((y) => `${y}Value`), ...yNegativeAccessor.map((y) => `${y}Value`)]}
        labels={[...yPositiveLabels, ...yNegativeLabels]}
        colors={[...yPositiveColors, ...yNegativeColors]}
        format=rate
      />
    </g>
  </g>

</MC>
