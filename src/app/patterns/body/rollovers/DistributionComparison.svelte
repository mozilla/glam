<script>
import { onMount, getContext } from 'svelte';
import { fade } from 'svelte/transition';
import {
  line, curveStep, symbol, symbolStar as referenceSymbol,
} from 'd3-shape';
import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../../components/data-graphics/LeftAxis.svelte';
import RightAxis from '../../../../components/data-graphics/RightAxis.svelte';
import BuildIDRollover from '../../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../../components/data-graphics/LineMultiple.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import { nearestBelow } from '../../../../utils/stats';

export let leftDistribution;
export let rightDistribution;
export let leftLabel;
export let rightLabel;
export let leftPercentiles;
export let rightPercentiles;
export let xDomain;
export let yDomain;
export let width;
export let height;
export let xType;
export let yType;
export let xAccessor = 'bin';
export let yAccessor = 'value';

const margins = getContext('margins');

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
  if (yScale.type !== 'scalePoint') return yScale(value);
  return yScale(nearestBelow(value, yDomain));
}

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
  right={40}
>
  <rect 
    x={leftPlot}
    y={topPlot}
    width={rightPlot - leftPlot}
    height={bottomPlot - topPlot}
    fill="var(--cool-gray-200)"
    opacity=.25
  />

  <!-- <LeftAxis tickCount=6 />
  <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} /> -->

  {#if leftPercentiles && rightPercentiles}
  {#each leftPercentiles as leftP, i}
    <line 
      x1={leftPlot}
      x2={rightPlot}
      y1={placeShapeY(leftP[yAccessor])}
      y2={placeShapeY(rightPercentiles[i][yAccessor])}
      stroke={percentileLineColorMap(leftP[xAccessor])}
    />
    <circle 
      cx={leftPlot} 
      cy={placeShapeY(leftP[yAccessor])} 
      r=2
      fill={percentileLineColorMap(leftP[xAccessor])}
    />
    <g style="transform:translate({rightPlot}px, {placeShapeY(rightPercentiles[i][yAccessor])}px)">
      <path 
        d={symbol().type(referenceSymbol).size(20)()} 
        fill={percentileLineColorMap(leftP[xAccessor])}
      />
  </g>
  {/each}
{/if}

  {#if leftDistribution}
  <g transition:fade={{ duration: 50 }}>
    <Violin 
      showLeft={false}
      xp={(rightPlot - leftPlot) / 2 + leftPlot - 1}
      key={leftLabel}
      opacity=.9
      y={leftDistribution} 
      densityAccessor='value'
      valueAccessor='bin'
      densityRange={[0, 30]}
      areaColor="var(--digital-blue-400)"
      lineColor="var(--digital-blue-500)"
    />
  </g>
  {/if}
    {#if rightDistribution}
      <Violin 
      showRight={false}
      xp={(rightPlot - leftPlot) / 2 + leftPlot + 1}
      opacity=.9
      key={rightLabel}
      y={rightDistribution} 
      densityAccessor='value'
      valueAccessor='bin'
      densityRange={[0, 30]}
      areaColor="var(--digital-blue-400)"
      lineColor="var(--digital-blue-500)"
      />
    {/if}

    <RightAxis tickCount=6 />
    <BottomAxis ticks={['hovered', 'latest']}  />
</DataGraphic>    