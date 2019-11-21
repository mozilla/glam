<script>
import { createEventDispatcher } from 'svelte';
import { format } from 'd3-format';
import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import BuildIDCell from '../table/BuildIDCell.svelte';
import CountProportionCell from '../table/CountProportionCell.svelte';
import SingleNumberCell from '../table/SingleNumberCell.svelte';
import ComparisonCell from '../table/ComparisonCell.svelte';

const numberFormat = format('.0f');


export let datum;
export let reference;
export let biggestAudience = datum.audienceSize;
export let isReference;
export let distributionScaleType = 'scalePoint';
export let disabled = false;
export let mainReference = false;

export let xDomain;

let hovered = false;

const dispatch = createEventDispatcher();
function onClick(v) {
  dispatch('click', {
    value: v,
  });
}

</script>

<style>

.median {
  font-weight: bold;
  font-size: var(--text-03);
}

.reference {
  background-color: var(--pantone-red-100);
}

.disabled {
  opacity:.5;
  background-color: var(--cool-gray-100);
}

/* :global(.reference td:last-child:before) {
  content: 'reference';
  position: absolute;
  right: 0px;
  padding-left: var(--space-1h);
  padding-right: var(--space-1h);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: bold;
  color: var(--pantone-red-600);

}

:global(.disabled td:last-child:before) {
  content: 'current reference';
  position: absolute;
  right: 0px;
  padding-left: var(--space-1h);
  padding-right: var(--space-1h);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: bold;
  color: var(--cool-gray-600);
} */

</style>

<tr class:disabled class:reference={isReference} on:mouseout={() => { hovered = false; }} on:mouseover={() => { hovered = true; }} on:click={() => { onClick(datum); }}>
  
    <BuildIDCell label={datum.label} />

    <CountProportionCell 
      count={datum.audienceSize} 
      total={biggestAudience}
      referenceCount={reference.audienceSize}
      {hovered}
    />
    
    {#each Object.keys(datum.percentiles) as p, i (p + datum.percentiles[p])}
      <SingleNumberCell>
        <div class:median={p === '50'}>
          {numberFormat(datum.percentiles[p])}
        </div>
      </SingleNumberCell>
    {/each}

    <ComparisonCell
      distributionScaleType={distributionScaleType}
      xDomain={xDomain}
      colorMap={(v) => percentileLineColorMap(+v)}
      hovered={!isReference && hovered}
      hoverDistributionValues={datum.histogram}
      referenceDistributionValues={reference.histogram}
      hoverPointValues={datum.transformedPercentiles}
      referencePointValues={reference.transformedPercentiles}
      isReference={isReference}
      disabled={disabled}
      mainReference={mainReference}
      topLabel={datum.label}
      bottomLabel={reference.label}
    />

  </tr>