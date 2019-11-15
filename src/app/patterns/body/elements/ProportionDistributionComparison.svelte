<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { derived } from 'svelte/store';
import { spring } from 'svelte/motion';

import { scalePoint } from 'd3-scale';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import RightAxis from '../../../../components/data-graphics/RightAxis.svelte';
import ReferenceSymbol from './ReferenceSymbol.svelte';

import { nearestBelow } from '../../../../utils/stats';

import { twoPointSpring } from '../utils/animation';

export let leftLabel;
export let rightLabel;
export let leftPoints;
export let rightPoints;
export let activeBins;

export let yTickFormatter = (t) => t;
export let colorMap = () => 'black';

export let yDomain;
export let width;
export let height;
export let xType;
export let yType;
export let showViolins = true;
export let key = Math.random().toString(36).substring(7);
export let yAccessor = 'value';

export let compareStyle = 'slope';

const xDomain = ['hovered', 'ref.'];

let L;
let R;
let T;
let B;
let leftPlot;
let rightPlot;
let topPlot;
let bottomPlot;
let yScale;

onMount(() => {
  L.subscribe((l) => { leftPlot = l; });
  R.subscribe((r) => { rightPlot = r; });
  T.subscribe((t) => { topPlot = t; });
  B.subscribe((b) => { bottomPlot = b; });
});

function placeShapeY(value) {
  if (!yScale) return bottomPlot || height;
  if (yScale.type !== 'scalePoint') return yScale(value);
  return yScale(nearestBelow(value, yDomain));
}

const dotsAndLines = twoPointSpring(rightPoints, rightPoints, placeShapeY, colorMap);

$: if (leftPoints) dotsAndLines.setHover(leftPoints);
$: if (rightPoints) dotsAndLines.setReference(rightPoints);

let xScale = scalePoint().domain(activeBins).range([leftPlot, rightPlot]).padding(0.8);
$: xScale = xScale.domain(activeBins);
$: xScale = xScale.range([leftPlot, rightPlot]);

</script>

<DataGraphic
  xDomain={xDomain}
  yDomain={yDomain}
  yType={yType}
  width={width}
  height={height}
  bind:leftPlot={L}
  bind:rightPlot={R}
  bind:topPlot={T}
  bind:bottomPlot={B}
  bind:yScale={yScale}
  left={10}
  right={50}
  key={key}
>
  <rect 
    x={leftPlot}
    y={topPlot}
    width={rightPlot - leftPlot}
    height={bottomPlot - topPlot}
    fill="var(--cool-gray-200)"
    opacity=.25
  />
  <RightAxis tickFormatter={yTickFormatter} tickCount=6 />
  <!-- <BottomAxis ticks={xDomain}  /> -->

  {#if rightPoints}
    {#each activeBins as bin, i}
      <ReferenceSymbol 
        xLocation={compareStyle === 'slope' ? rightPlot : xScale(bin)} 
        yLocation={$dotsAndLines[bin].rightY} 
        color={$dotsAndLines[bin].color} />
      {#if compareStyle === 'distance'}
          <line 
            x1={xScale(bin)}
            x2={xScale(bin)}
            y1={bottomPlot}
            y2={$dotsAndLines[bin].rightY}
            stroke=var(--cool-gray-300)
            stroke-dasharray=4,1
          />
        {/if}
    {/each}
  {/if}

  {#if leftPoints && rightPoints}
  {#each activeBins as bin, i}
    <line 
    x1={compareStyle === 'slope' ? leftPlot : xScale(bin)}
    x2={compareStyle === 'slope' ? rightPlot : xScale(bin)}
    y1={$dotsAndLines[bin].leftY}
    y2={$dotsAndLines[bin].rightY}
    stroke={$dotsAndLines[bin].color}
    stroke-width=2
    />
    <circle 
    cx={compareStyle === 'slope' ? leftPlot : xScale(bin)} 
    cy={$dotsAndLines[bin].leftY} 
    r=3
    fill={$dotsAndLines[bin].color}
    />
  {/each}

{/if}



</DataGraphic>    
