<script>
import { onMount } from 'svelte';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import RightAxis from '../../../../components/data-graphics/RightAxis.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';
import Line from '../../../../components/data-graphics/LineMultiple.svelte';

import { nearestBelow } from '../../../../utils/stats';

import { twoPointSpring } from '../utils/animation';

import { explorerComparisonSmallMultiple } from '../utils/constants';

export let leftDistribution;
export let rightDistribution;
export let leftLabel;
export let rightLabel;
export let leftPoints;
export let rightPoints;
export let activeBins;

// this is the case of having only 2 points.
export let insufficientData = false;
export let dataVolume = Infinity;

export let yTickFormatter = (t) => t;
export let colorMap = () => 'black';

export let yDomain;

export let xType;
export let yType;
export let showViolins = true;
export let key = Math.random().toString(36).substring(7);
export let yAccessor = 'value';

export let xDomain = dataVolume <= 2 ? [leftLabel, rightLabel] : ['HOV.', 'REF.'];

let L;
let R;
let T;
let B;
let leftPlot;
let rightPlot;
let topPlot;
let bottomPlot;
let xScale;
let yScale;

onMount(() => {
  L.subscribe((l) => { leftPlot = l; });
  R.subscribe((r) => { rightPlot = r; });
  T.subscribe((t) => { topPlot = t; });
  B.subscribe((b) => { bottomPlot = b; });
});

function placeShapeY(value) {
  if (!yScale) return bottomPlot || explorerComparisonSmallMultiple.height;
  if (yScale.type !== 'scalePoint') return yScale(value);
  return yScale(nearestBelow(value, yDomain));
}

const dotsAndLines = twoPointSpring(rightPoints, rightPoints, placeShapeY, colorMap);

// If insufficient data, let's not use the spring on mount.
$: if (leftPoints) dotsAndLines.setHover(leftPoints, dataVolume <= 2);
$: if (rightPoints) dotsAndLines.setReference(rightPoints, dataVolume <= 2);

</script>

<DataGraphic
  xDomain={xDomain}
  yDomain={yDomain}
  yType={yType}
  width={explorerComparisonSmallMultiple.width
    + (dataVolume <= 2 ? explorerComparisonSmallMultiple.insufficientDataAdjustment : 0)}
  height={explorerComparisonSmallMultiple.height}
  bind:leftPlot={L}
  bind:rightPlot={R}
  bind:topPlot={T}
  bind:bottomPlot={B}
  bind:xScale={xScale}
  bind:yScale={yScale}
  left={explorerComparisonSmallMultiple.left}
  right={explorerComparisonSmallMultiple.right}
  bottom={explorerComparisonSmallMultiple.bottom}
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
  <TopAxis ticks={xDomain}  />

  {#if leftPoints && rightPoints}
    {#each activeBins as bin, i}
      {#if dataVolume !== 2}
      <line 
        x1={leftPlot}
        x2={rightPlot}
        y1={$dotsAndLines[bin].leftY}
        y2={$dotsAndLines[bin].rightY}
        stroke={$dotsAndLines[bin].color}
        stroke-width={dataVolume === 1 ? 1 : 2}
        stroke-opacity={dataVolume === 1 ? 0.5 : 1}
      />

      {:else}
        <!-- This is the case of only having two points. -->
        <Line
          yAccessor={'y'}
          xAccessor={'label'}
          useYScale={false}
          curve={'curveStep'}
          color={$dotsAndLines[bin].color}
          data={[
            {
              y: $dotsAndLines[bin].leftY,
              label: leftLabel,
            },
            {
              y: $dotsAndLines[bin].rightY,
              label: rightLabel,

           },
          ]}
        />
      {/if}
      <circle 
        cx={dataVolume === 2 ? xScale(leftLabel) : leftPlot} 
        cy={$dotsAndLines[bin].leftY} 
        r=3
        fill={$dotsAndLines[bin].color}
      />
    {/each}
  {/if}
  {#each activeBins as bin, i}
    <ReferenceSymbol 
      xLocation={dataVolume === 2 ? xScale(rightLabel) : rightPlot} 
      yLocation={$dotsAndLines[bin].rightY} 
      color={$dotsAndLines[bin].color} 
    />
  {/each}
  
  <slot name='body'
    leftPlot={leftPlot} 
    rightPlot={rightPlot} 
    topPlot={topPlot} 
    bottomPlot={bottomPlot}
  >
  
  </slot>

</DataGraphic>    
