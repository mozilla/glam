<script>
  import { DataGraphic } from '@graph-paper/datagraphic';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions/tooltip';

  import { Axis } from '@graph-paper/guides';

  import Tweenable from '../Tweenable.svelte';
  import ChartTitle from './ChartTitle.svelte';
  import { compareClientCountsGraph, tween } from '../../utils/constants';
  import { formatCount } from '../../utils/formatters';

  export let description;
  export let hoverValue;
  export let referenceValue;
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
    <ChartTitle {description} left={compareClientCountsGraph.left} right={compareClientCountsGraph.right}>
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
    yDomain={yDomain}
    xType=scalePoint
    yType=linear
    bottomBorder
    borderColor={compareClientCountsGraph.borderColor}
  >

    <g slot=background let:left let:top let:right let:bottom let:yScale>
      <rect
          x={left}
          y={top}
          width={(right - left) / 2}
          height={bottom - top}
          fill={compareClientCountsGraph.bgColor}
          use:tooltipAction={{
      text: 'Shows the distribution of the currently-hovered point on the line chart',
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
  text: 'Shows the distribution of the current reference point on the line chart',
          location: 'top',
  alignment: 'center',
        }}
      />
      <Axis side="right" tickFormatter={formatCount} ticks={yScale.ticks(4)} />
      <Axis side="bottom" ticks={['HOV.', 'REF.']}  />
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
