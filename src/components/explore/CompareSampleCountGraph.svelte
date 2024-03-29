<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions/tooltip';

  import { Axis } from '@graph-paper/guides';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';

  import Tweenable from '../Tweenable.svelte';
  import ChartTitle from './ChartTitle.svelte';
  import { compareClientCountsGraph, tween } from '../../utils/constants';
  import { formatCompact } from '../../utils/formatters';

  export let description;
  export let leftSampleValue;
  export let rightSampleValue;
  export let yDomain;
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
  <ChartTitle
    {description}
    left={compareClientCountsGraph.left}
    right={compareClientCountsGraph.right}
  >
    Compare
  </ChartTitle>

  <DataGraphic
    width={compareClientCountsGraph.width}
    height={compareClientCountsGraph.height}
    top={compareClientCountsGraph.top}
    bottom={compareClientCountsGraph.bottom}
    left={compareClientCountsGraph.left}
    right={compareClientCountsGraph.right}
    xDomain={['HOV.', 'REF.']}
    {yDomain}
    xType="scalePoint"
    yType="linear"
    bottomBorder
    borderColor={compareClientCountsGraph.borderColor}
  >
    <g slot="background" let:left let:top let:right let:bottom let:yScale>
      <rect
        x={left}
        y={top}
        width={(right - left) / 2}
        height={bottom - top}
        fill={compareClientCountsGraph.bgColor}
        use:tooltipAction={{
          text: 'Shows the distribution of the left point on the line chart',
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
          text: 'Shows the distribution of the right point on the line chart',
          location: 'top',
          alignment: 'center',
        }}
      />
      <Axis
        side="right"
        tickFormatter={formatCompact}
        ticks={yScale.ticks(4)}
      />
    </g>
    <g slot="body" let:top let:bottom let:xScale let:yScale>
      <Tweenable params={tween} value={rightSampleValue} let:tweenValue={tw}>
        <rect
          class="client-bar"
          x={xScale('REF.') - xScale.step() / 4}
          y={yScale(tw)}
          width={xScale.step() / 2}
          height={bottom - yScale(tw)}
        />
        <line
          class="client-peak"
          x1={xScale('REF.') - xScale.step() / 4}
          x2={xScale('REF.') + xScale.step() / 4}
          y1={yScale(tw)}
          y2={yScale(tw)}
        />
      </Tweenable>
      {#if leftSampleValue}
        <rect
          class="client-bar"
          x={xScale('HOV.') - xScale.step() / 4}
          y={yScale(leftSampleValue)}
          width={xScale.step() / 2}
          height={bottom - yScale(leftSampleValue)}
        />
        <line
          class="client-peak"
          x1={xScale('HOV.') - xScale.step() / 4}
          x2={xScale('HOV.') + xScale.step() / 4}
          y1={yScale(leftSampleValue)}
          y2={yScale(leftSampleValue)}
        />
      {/if}
    </g>
  </DataGraphic>
</div>
