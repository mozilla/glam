<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { derived } from 'svelte/store';
import { spring } from 'svelte/motion';

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
export let leftPoints;
export let rightPoints;
export let activeBins;
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
  if (!yScale) return bottomPlot || height;
  if (yScale.type !== 'scalePoint') return yScale(value);
  return yScale(nearestBelow(value, yDomain));
}

function ptToSpringValue(pt) {
  if (pt === undefined) return undefined;
  const out = { ...pt };
  Object.keys(out).forEach((k) => {
    out[k] = placeShapeY(out[k]);
  });
  return out;
}

let leftValues = spring(ptToSpringValue(rightPoints), { damping: 1, stiffness: 0.7 });
let rightValues = spring(ptToSpringValue(rightPoints), { damping: 0.4, stiffness: 0.8 });
$: if (leftPoints) leftValues.set(ptToSpringValue(leftPoints));
$: if (rightPoints) rightValues.set(ptToSpringValue(rightPoints));


const dotsAndLines = derived([leftValues, rightValues], ([$left, $right]) => {
  if (!leftPoints || !rightPoints) return [];
  const dal = Object.keys($right).reduce((acc, k) => {
    const rightY = $right[k];
    const leftY = $left[k];
    const color = colorMap(k);
    acc[k] = { leftY, rightY, color };
    return acc;
  }, {});
  return dal;
});

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

  {#if Object.keys($dotsAndLines).length}
  {#each activeBins as bin, i}
    <line 
    x1={leftPlot}
    x2={rightPlot}
    y1={$dotsAndLines[bin].leftY}
    y2={$dotsAndLines[bin].rightY}
    stroke={$dotsAndLines[bin].color}
    />
    <circle 
    cx={leftPlot} 
    cy={$dotsAndLines[bin].leftY} 
    r=2
    fill={$dotsAndLines[bin].color}
    />
    <ReferenceSymbol xLocation={rightPlot} yLocation={$dotsAndLines[bin].rightY} color={$dotsAndLines[bin].color} />
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
