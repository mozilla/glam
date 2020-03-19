<script>
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import Help from 'udgl/icons/Help.svelte';
import RightAxis from 'udgl/data-graphics/guides/RightAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import { compareClientCountsGraph, tween } from '../../utils/constants';
import { formatCount } from '../../utils/formatters';

export let description;
export let hoverValue;
export let referenceValue;
export let yDomain;
// get yDomain.

</script>

<style>
.client-bar {
  fill: var(--cool-gray-250);
}

.client-peak {
  stroke: var(--cool-gray-550);
}
</style>

<div>
  <h3 style='padding-left: {compareClientCountsGraph.left}px; padding-right: {compareClientCountsGraph.right}px' class=data-graphic__element-title>
    Compare
    <span use:tooltipAction={
      {
        text: description,
        location: 'top',
  }
    } class=data-graphic__element-title__icon><Help size={14} /></span></h3>

<DataGraphic
  width={compareClientCountsGraph.width}
  height={compareClientCountsGraph.height}
  top={compareClientCountsGraph.top}
  bottom={compareClientCountsGraph.bottom}
  left={compareClientCountsGraph.left}
  right={compareClientCountsGraph.right}
  xDomain={['HOV.', 'REF.']}
  yDomain={yDomain}
  xType=scalePoint
  yType=linear
  bottomBorder
  borderColor={compareClientCountsGraph.borderColor}
>
  <RightAxis tickFormatter={formatCount} tickCount={3} />
  <BottomAxis ticks={['HOV.', 'REF.']}  />

  <g slot=background let:left let:top let:right let:bottom>
    <rect
        x={left}
        y={top}
        width={(right - left) / 2}
        height={bottom - top}
        fill={compareClientCountsGraph.bgColor}
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
      fill={compareClientCountsGraph.bgColor}
      use:tooltipAction={{
text: 'shows the distribution of the current reference point on the line chart',
        location: 'top',
alignment: 'center',
      }}
    />
  </g>
  <g slot=body let:top let:bottom let:xScale let:yScale>
    <Tweenable params={tween} value={referenceValue} let:tweenValue={tw}>
      <rect
        class=client-bar
        x={xScale('REF.') - xScale.step() / 4}
        y={yScale(tw)}
        width={xScale.step() / 2}
        height={bottom - yScale(tw)}
      />
      <line 
        class=client-peak
        x1={xScale('REF.') - xScale.step() / 4}
        x2={xScale('REF.') + xScale.step() / 4}
        y1={yScale(tw)}
        y2={yScale(tw)}
      />
    </Tweenable>
    {#if hoverValue}
      <rect
        class=client-bar
        x={xScale('HOV.') - xScale.step() / 4}
        y={yScale(hoverValue)}
        width={xScale.step() / 2}
        height={bottom - yScale(hoverValue)}
      />
      <line 
        class=client-peak
        x1={xScale('HOV.') - xScale.step() / 4}
        x2={xScale('HOV.') + xScale.step() / 4}
        y1={yScale(hoverValue)}
        y2={yScale(hoverValue)}
      />
    {/if}
  </g>

</DataGraphic>

</div>