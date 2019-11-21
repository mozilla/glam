<script>
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import { writable } from 'svelte/store';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';
import { nearestBelow } from '../../../../utils/stats';

import { twoPointSpring, histogramSpring } from '../utils/animation';
import { comparisonSmallMultiple } from '../utils/constants';

export let xDomain;
export let distributionScaleType;
export let colorMap;
export let hovered = false;
export let isReference = false;

export let topLabel;
export let bottomLabel;

export let hoverDistributionValues;
export let hoverPointValues;
export let referenceDistributionValues;
export let referencePointValues;
export let disabled = false;
export let mainReference = false;

let distributionXScale;

function place(value) {
  if (!distributionXScale) {
    return comparisonSmallMultiple.width / 2;
  }
  if (distributionXScale.type !== 'scalePoint') return distributionXScale(value);
  return distributionXScale(nearestBelow(value, xDomain));
}

const refAndHovered = twoPointSpring(
  hoverPointValues,
  hoverPointValues,
  place,
  colorMap,
);

$: refAndHovered.setReference(referencePointValues);
$: refAndHovered.setHover(hoverPointValues);


const topSpring = histogramSpring(hoverDistributionValues);
const bottomSpring = histogramSpring(referenceDistributionValues);

$: topSpring.setValue(hoverDistributionValues);
$: bottomSpring.setValue(referenceDistributionValues);

onMount(() => {
  refAndHovered.setReference(referencePointValues, true);
  refAndHovered.setHover(hoverPointValues, true);
});

let justClicked = false;

$: if (isReference) {
  justClicked = true;
  setTimeout(() => {
    justClicked = false;
  }, 1000);
}

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
      {#each Object.keys($refAndHovered) as p, i}
          {#if mainReference}
          <ReferenceSymbol
            xLocation={$refAndHovered[p].leftY} 
            yLocation={6} 
            size={20}
            color={disabled ? 'var(--cool-gray-500)' : $refAndHovered[p].color} />
          {:else}
          <circle
            opacity={hovered ? 1 : 0.6}
            cx={$refAndHovered[p].leftY} 
            cy={ 6} r=2 fill={disabled ? 'var(--cool-gray-500)' : $refAndHovered[p].color} />
          {/if}
      {/each}
      {#if hovered || disabled}
        {#each Object.keys($refAndHovered) as p, i}
            <line
              x1={distributionXScale(hoverPointValues[p])}
              x2={$refAndHovered[p].rightY}
              y1={6}
              y2={comparisonSmallMultiple.height - 6}
              stroke={disabled ? 'var(--cool-gray-500)' : $refAndHovered[p].color}
            />
            <ReferenceSymbol
              xLocation={$refAndHovered[p].rightY} 
              yLocation={comparisonSmallMultiple.height - 6} 
              size={20}
              color={disabled ? 'var(--cool-gray-500)' : $refAndHovered[p].color} />
        {/each}
      {/if}
  {/if}
  {#if hoverDistributionValues}
    <Violin
      orientation='horizontal'
      key={topLabel}
      rawPlacement={comparisonSmallMultiple.height / 2.0 - 0.5}
      density={$topSpring}
      densityAccessor='value'
      showLeft={false}
      valueAccessor='bin'
      opacity={hovered || isReference ? 0.9 : 0.6}
      densityRange={[0, comparisonSmallMultiple.height / 4.0]}
      areaColor={disabled ? 'var(--cool-gray-500)' : 'var(--digital-blue-400)'}
      lineColor={disabled ? 'var(--cool-gray-400)' : 'var(--digital-blue-500)'}
    />
{/if}

{#if mainReference || disabled || (hovered && !isReference)}
<Violin 
  key={bottomLabel}
  orientation='horizontal'
  rawPlacement={comparisonSmallMultiple.height / 2.0 + 0.5}
  density={$bottomSpring}
  densityAccessor='value'
  showRight={false}
  rightLabel={bottomLabel}
  valueAccessor='bin'
  opacity={hovered || isReference ? 0.9 : 0.6}
  densityRange={[0, comparisonSmallMultiple.height / 4.0]}
  areaColor={disabled ? 'var(--cool-gray-500)' : 'var(--digital-blue-400)'}
  lineColor={disabled ? 'var(--cool-gray-400)' : 'var(--digital-blue-500)'}
/>
{/if}
{#if hovered}
  <text 
    x={comparisonSmallMultiple.width - 3}
    y={10}
    text-anchor=end
    font-size=10
    font-weight=bold
    fill=var(--cool-gray-500)
    style="text-transform: uppercase"
  >hovered</text>

  <text 
    x={comparisonSmallMultiple.width - 3}
    y={comparisonSmallMultiple.height - 3}
    text-anchor=end
    font-size=10
    font-weight=bold
    fill=var(--pantone-red-500)
    style="text-transform: uppercase"
  >ref.</text>
{/if}
  <!-- FIXME: this should be simplified -->
  {#if !justClicked && disabled}
    <text
    in:fly={{ duration: 200, x: 10 }}
    x={comparisonSmallMultiple.width - 3}
      y={10}
      text-anchor=end
      font-size=10
      font-weight=bold
      fill=var(--cool-gray-500)
      style="text-transform: uppercase"
    >current reference</text>
  {/if}
  
  {#if justClicked && !mainReference}
    <text
      transition:fly={{ duration: 200, x: 10 }}
      x={comparisonSmallMultiple.width - 3}
      y={10}
      text-anchor=end
      font-size=10
      fill=var(--cool-gray-500)
      style="text-transform: uppercase"
    >ref. set</text>
  {/if}


  {#if mainReference && isReference && !disabled}
    <text
      in:fly={{ duration: 200, x: 10 }}
      x={comparisonSmallMultiple.width - 3}
      y={10}
      text-anchor=end
      font-size=10
      font-weight=bold
      fill=var(--pantone-red-500)
      style="text-transform: uppercase"
    >reference</text>
  {/if}

  </DataGraphic>
</td>