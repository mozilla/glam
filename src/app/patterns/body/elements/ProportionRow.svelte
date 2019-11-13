<script>
import { createEventDispatcher } from 'svelte';
import { formatPercent, formatCount } from '../utils/formatters';
import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import BuildIDCell from '../table/BuildIDCell.svelte';
import CountProportionCell from '../table/CountProportionCell.svelte';
import SingleNumberCell from '../table/SingleNumberCell.svelte';
import ComparisonCell from '../table/ComparisonCell.svelte';


const dispatch = createEventDispatcher();
function onClick(v) {
  dispatch('click', {
    value: v,
  });
}

export let datum;
export let reference;
export let biggestAudience = datum.audienceSize;
export let isReference;
export let distributionScaleType = 'scalePoint';
export let activeBuckets;
export let metricType;
export let bucketColorMap = () => 'black';

const numberFormat = metricType === 'proportions' ? formatPercent : formatCount;

export let xDomain;

let hovered = false;

</script>

<style>

.reference {
  background-color: var(--pantone-red-100);
}

</style>

<tr class:reference={isReference} on:mouseout={() => { hovered = false; }} on:mouseover={() => { hovered = true; }} on:click={() => { onClick(datum); }}>
  
    <BuildIDCell label={datum.label} />

    <CountProportionCell 
      count={datum.audienceSize} 
      total={biggestAudience}
      referenceCount={reference.audienceSize}
      {hovered}
    />
    {#each activeBuckets as b, i}
      <SingleNumberCell>
        {numberFormat(datum[metricType][b])}
      </SingleNumberCell>
    {/each}

    <ComparisonCell
      distributionScaleType={distributionScaleType}
      xDomain={xDomain}
      colorMap={bucketColorMap}
      hovered={hovered}
      hoverPointValues={datum[metricType]}
      referencePointValues={reference[metricType]}
      isReference={isReference}
    />

  </tr>