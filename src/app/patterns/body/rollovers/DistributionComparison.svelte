<script>
import { onMount, getContext } from 'svelte';
import { fade } from 'svelte/transition';
import {
  line, curveStep, symbol, symbolTriangle,
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

</script>

<DataGraphic
  xDomain={xDomain}
  yDomain={yDomain}
  yType="scalePoint"
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
    <!-- <path 
    d={line().curve(curveStep)([
      [leftPlot, yScale(nearestBelow(leftP.value, yDomain))],
    [rightPlot, yScale(nearestBelow(rightPercentiles[i].value, yDomain))]])}
    stroke={percentileLineColorMap(leftP.bin)}
    fill="none"
    /> -->
    <line 
      x1={leftPlot}
      x2={rightPlot}
      y1={yScale(nearestBelow(leftP.value, yDomain))}
      y2={yScale(nearestBelow(rightPercentiles[i].value, yDomain))}
      stroke={percentileLineColorMap(leftP.bin)}
    />
    <circle 
      cx={leftPlot} 
      cy={yScale(nearestBelow(leftP.value, yDomain))} 
      r=2
      fill={percentileLineColorMap(leftP.bin)}
    />
    <g style="transform:translate({rightPlot}px, {yScale(nearestBelow(rightPercentiles[i].value, yDomain))}px)">
      <path 
        d={symbol().type(symbolTriangle).size(20)()} 
        fill={percentileLineColorMap(leftP.bin)}
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


    <!-- {#if leftPercentiles}
      {#each leftPercentiles as percentile, i}
        <line 
          x1={leftPlot + margins.buffer * 2} 
          x2={leftPlot}
          y1={yScale(nearestBelow(percentile.value, yDomain))}
          y2={yScale(nearestBelow(percentile.value, yDomain))}
          stroke={percentileLineColorMap(percentile.bin)}
          stroke-width=2 />
      {/each}
    {/if}
    {#if rightPercentiles}
      {#each rightPercentiles as percentile, i}
        <line 
          x1={rightPlot - margins.buffer * 2} 
          x2={rightPlot}
          y1={yScale(nearestBelow(percentile.value, yDomain))}
          y2={yScale(nearestBelow(percentile.value, yDomain))}
          stroke={percentileLineColorMap(percentile.bin)}
          stroke-width=2 />
      {/each}
    {/if} -->
</DataGraphic>    