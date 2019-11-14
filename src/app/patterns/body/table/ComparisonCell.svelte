<script>

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';

import { comparisonSmallMultiple } from '../utils/constants';

export let xDomain;
export let distributionScaleType;
export let colorMap;
export let hovered = false;
export let isReference = false;

export let hoverDistributionValues;
export let hoverPointValues;
export let referenceDistributionValues;
export let referencePointValues;

let distributionXScale;

</script>

<td class=data-cell--graphic>
    <DataGraphic
      width={comparisonSmallMultiple.width}
      height={comparisonSmallMultiple.height}
      left={comparisonSmallMultiple.left}
      right={comparisonSmallMultiple.right}
      top={0}
      bottom={0}
      bind:xScale={distributionXScale}
      xDomain={xDomain}
      yDomain={['top', 'bottom']}
      xType={distributionScaleType}
    >
      <TopAxis tickCount=6 lineStyle='long' />
      {#if distributionXScale}
        {#each Object.keys(hoverPointValues) as p, i}
            <circle
              opacity={hovered ? 1 : 0.6}
              cx={distributionXScale(hoverPointValues[p])} 
              cy={ 6} r=2 fill={colorMap(p)} />
        {/each}
        {#if hovered}
          {#each Object.keys(referencePointValues) as p, i}
              <line
                x1={distributionXScale(hoverPointValues[p])}
                x2={distributionXScale(referencePointValues[p])}
                y1={6}
                y2={comparisonSmallMultiple.height - 6}
                stroke={colorMap(p)}
              />

              <ReferenceSymbol
                xLocation={distributionXScale(referencePointValues[p])} 
                yLocation={comparisonSmallMultiple.height - 6} 
                color={colorMap(p)} />
          {/each}
        {/if}
    {/if}
    {#if hoverDistributionValues}
      <Violin 
        orientation='horizontal'
        rawPlacement={comparisonSmallMultiple.height / 2.0 - 0.5}
        density={hoverDistributionValues}
        densityAccessor='value'
        showLeft={false}
        valueAccessor='bin'
        opacity={hovered || isReference ? 0.9 : 0.6}
        densityRange={[0, comparisonSmallMultiple.height / 4.0]}
        areaColor="var(--digital-blue-400)"
        lineColor="var(--digital-blue-500)"
      />
  {/if}
  {#if hovered}
    {#if referenceDistributionValues}
      <Violin 
        orientation='horizontal'
        rawPlacement={comparisonSmallMultiple.height / 2.0 + 0.5}
        density={referenceDistributionValues}
        densityAccessor='value'
        showRight={false}
        valueAccessor='bin'
        opacity={hovered || isReference ? 0.9 : 0.6}
        densityRange={[0, comparisonSmallMultiple.height / 4.0]}
        areaColor="var(--digital-blue-400)"
        lineColor="var(--digital-blue-500)"
      />
    {/if}
    <text 
      x={comparisonSmallMultiple.width - 3}
      y={10}
      text-anchor=end
      font-size=10
      font-weight=bold
      fill=var(--cool-gray-500)
    >hovered</text>
    <text 
      x={comparisonSmallMultiple.width - 3}
      y={comparisonSmallMultiple.height - 3}
      text-anchor=end
      font-size=10
      font-weight=bold
      fill=var(--pantone-red-500)
    >ref.</text>
  {/if}
    </DataGraphic>
  </td>