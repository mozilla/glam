<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import RightAxis from '../../../../components/data-graphics/RightAxis.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import ReferenceSymbol from './ReferenceSymbol.svelte';

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

let dotsAndLines = [];
$: if (leftPercentiles && leftPercentiles) {
  dotsAndLines = leftPercentiles.map(({ value, bin }) => {
    let rightY = placeShapeY(rightPercentiles.find((r) => r.bin === bin).value);
    let leftY = placeShapeY(value);
    let color = colorMap(bin);
    return { leftY, rightY, color };
  });
} else {
  dotsAndLines = [];
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
  {#each dotsAndLines as {leftY, rightY, color}, i}
    <line 
      x1={leftPlot}
      x2={rightPlot}
      y1={leftY}
      y2={rightY}
      stroke={color}
    />
    <circle 
      cx={leftPlot} 
      cy={leftY} 
      r=2
      fill={color}
    />
    <ReferenceSymbol xLocation={rightPlot} yLocation={rightY} color={color} />
  {/each}
{/if}

  {#if leftDistribution && showViolins}
  <g in:fade={{ duration: 50 }}>
    <Violin
      orientation="vertical"
      showLeft={false}
      rawPlacement={(rightPlot - leftPlot) / 2 + leftPlot - 1}
      key={leftLabel}
      opacity=.9
      density={leftDistribution} 
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
      orientation="vertical"
      showRight={false}
      rawPlacement={(rightPlot - leftPlot) / 2 + leftPlot + 1}
      opacity=.9
      key={rightLabel}
      density={rightDistribution} 
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