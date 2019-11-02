<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import {
  symbol, symbolStar as referenceSymbol,
} from 'd3-shape';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import RightAxis from '../../../../components/data-graphics/RightAxis.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';

import { nearestBelow } from '../../../../utils/stats';

export let leftDistribution;
export let rightDistribution;
export let leftLabel;
export let rightLabel;
export let leftPercentiles;
export let rightPercentiles;
export let yTickFormatter = (t) => t;
export let colorMap = () => 'black';
export let xDomain;
export let yDomain;
export let width;
export let height;
export let xType;
export let yType;
export let showViolins = true;
export let key = Math.random().toString(36).substring(7);
export let yAccessor = 'value';


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

  <!-- <LeftAxis tickCount=6 />
  <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} /> -->

  {#if leftPercentiles && rightPercentiles}
  {#each leftPercentiles as {label, bin, value}, i}
    <line 
      x1={leftPlot}
      x2={rightPlot}
      y1={placeShapeY(value)}
      y2={placeShapeY(rightPercentiles[i].value)}
      stroke={colorMap(bin)}
    />
    <circle 
      cx={leftPlot} 
      cy={placeShapeY(value)} 
      r=2
      fill={colorMap(bin)}
    />
    <g style="transform:translate({rightPlot}px, {placeShapeY(rightPercentiles[i].value)}px)">
      <path 
        d={symbol().type(referenceSymbol).size(20)()} 
        fill={colorMap(bin)}
      />
  </g>
  {/each}
{/if}

  {#if leftDistribution && showViolins}
  <g in:fade={{ duration: 50 }}>
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
  {#if rightDistribution && showViolins}
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

  <RightAxis tickFormatter={yTickFormatter} tickCount=6 />
  <BottomAxis ticks={['hovered', 'latest']}  />
</DataGraphic>    