<script>

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
 
export let xDomain = ['HOV.', 'REF.'];

if (dataVolume === 1) {
  xDomain = [rightLabel];
} else if (dataVolume === 2) {
  xDomain = [leftLabel, rightLabel]
}

let xScale;
let yScale;


function placeShapeY(value) {
  if (!yScale) return explorerComparisonSmallMultiple.height;
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
        {
text: 'compares the reference ⭑ to the hovered value on the "Over Time" chart ●',
         location: 'top',
}
      } class=data-graphic__element-title__icon><Help size={14} /></span></h3>
<DataGraphic
  xDomain={xDomain}
  yDomain={yDomain}
  yType={yScaleType}
  width={explorerComparisonSmallMultiple.width
    + (dataVolume <= 2 ? explorerComparisonSmallMultiple.insufficientDataAdjustment : 0)}
  height={explorerComparisonSmallMultiple.height}
  bind:xScale={xScale}
  bind:yScale={yScale}
  left={explorerComparisonSmallMultiple.left}
  right={explorerComparisonSmallMultiple.right}
  bottom={explorerComparisonSmallMultiple.bottom}
  top={explorerComparisonSmallMultiple.top}
  key={key}
>
  <g slot=background let:left let:bottom let:top let:right>
    <rect 
      x={left}
      y={top}
      width={(right - left) / 2}
      height={bottom - top}
      fill="var(--cool-gray-200)"
      opacity=.25
      use:tooltipAction={{
text: 'shows the distribution of the currently-hovered point on the line chart',
        location: 'top',
alignment: 'center',
      }}
    />
    <rect 
      x={(left + right) / 2}
      y={top}
      width={(right - left) / 2}
      height={bottom - top}
      fill="var(--cool-gray-200)"
      opacity=.25
      use:tooltipAction={{
text: 'shows the distribution of the current reference point on the line chart',
        location: 'top',
alignment: 'center',
      }}
    />
    <slot name='body'
      left={left} 
      right={right} 
      top={top} 
      bottom={bottom}
    >
    
    </slot>
  </g>
  <RightAxis tickFormatter={yTickFormatter} tickCount=6 />
  <TopAxis ticks={xDomain} />

  <g slot=mouseover let:left let:right>
    {#if leftPoints && rightPoints}
      {#each activeBins as bin, i}
        {#if dataVolume !== 2}
        <line 
          x1={left}
          x2={right}
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
          cx={dataVolume === 2 ? xScale(leftLabel) : left} 
          cy={$dotsAndLines[bin].leftY} 
          r=3
          fill={$dotsAndLines[bin].color}
        />
      {/each}
    {/if}
    {#each activeBins as bin, i}
      <ReferenceSymbol 
        xLocation={dataVolume === 2 ? xScale(rightLabel) : right} 
        yLocation={$dotsAndLines[bin].rightY} 
        color={$dotsAndLines[bin].color} 
      />
    {/each}
  </g>

</DataGraphic>    
</div>