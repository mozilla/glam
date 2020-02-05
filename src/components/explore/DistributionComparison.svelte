<script>
import { onMount } from 'svelte';

import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import TopAxis from 'udgl/data-graphics/guides/TopAxis.svelte';
import RightAxis from 'udgl/data-graphics/guides/RightAxis.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Help from 'udgl/icons/Help.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import ReferenceSymbol from '../ReferenceSymbol.svelte';

import { nearestBelow } from '../../utils/stats';

import { twoPointSpring } from '../../utils/animation';

import { explorerComparisonSmallMultiple } from '../../utils/constants';

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
export let yScaleType;
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

<div>
  <h3 style='padding-left: {explorerComparisonSmallMultiple.left}px' class=data-graphic__element-title>Compare
      <span use:tooltipAction={
        'compares the reference ⭑ to the hovered value on the "Over Time" chart ●',
        { location: 'top' }
      } class=data-graphic__element-title__icon><Help size={14} /></span></h3>
<DataGraphic
  xDomain={xDomain}
  yDomain={yDomain}
  yType={yScaleType}
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
  top={explorerComparisonSmallMultiple.top}
  key={key}
>
<!-- <rect 
  x={leftPlot}
  y={topPlot}
  width={rightPlot - leftPlot}
  height={bottomPlot - topPlot}
  fill="var(--cool-gray-200)"
  opacity=.25
  use:tooltipAction={'compares the currently hovered point (hov.) to the current reference (ref.)', {
    location: 'top', alignment: 'center',
  }}
/> -->
  <rect 
    x={leftPlot}
    y={topPlot}
    width={(rightPlot - leftPlot) / 2}
    height={bottomPlot - topPlot}
    fill="var(--cool-gray-200)"
    opacity=.25
    use:tooltipAction={'shows the distribution of the currently-hovered point on the line chart', {
      location: 'top', alignment: 'center',
    }}
  />
  <rect 
    x={(leftPlot + rightPlot) / 2}
    y={topPlot}
    width={(rightPlot - leftPlot) / 2}
    height={bottomPlot - topPlot}
    fill="var(--cool-gray-200)"
    opacity=.25
    use:tooltipAction={'shows the distribution of the current reference point on the line chart', {
      location: 'top', alignment: 'center',
    }}
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
</div>