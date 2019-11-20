<script>
  import { createEventDispatcher } from "svelte";
  import { format } from "d3-format";
  import { percentileLineColorMap } from "../../../../components/data-graphics/utils/color-maps";

  import BuildIDCell from "../table/BuildIDCell.svelte";
  import CountProportionCell from "../table/CountProportionCell.svelte";
  import SingleNumberCell from "../table/SingleNumberCell.svelte";
  import ComparisonCell from "../table/ComparisonCell.svelte";

  const numberFormat = format(".0f");

  const dispatch = createEventDispatcher();
  function onClick(v) {
    dispatch("click", {
      value: v
    });
  }

  export let datum;
  export let reference;
  export let biggestAudience = datum.audienceSize;
  export let isReference;
  export let distributionScaleType = "scalePoint";

  export let xDomain;

  let hovered = false;
</script>

<style>
  .median {
    font-weight: bold;
    font-size: var(--text-03);
  }

  .reference {
    background-color: var(--pantone-red-100);
  }
</style>

<tr
  class:reference={isReference}
  on:mouseout={() => {
    hovered = false;
  }}
  on:mouseover={() => {
    hovered = true;
  }}
  on:click={() => {
    onClick(datum);
  }}>

  <BuildIDCell label={datum.label} />

  <CountProportionCell
    count={datum.audienceSize}
    total={biggestAudience}
    referenceCount={reference.audienceSize}
    {hovered} />

  {#each Object.keys(datum.percentiles) as p, i (p + datum.percentiles[p])}
    <SingleNumberCell>
      <div class:median={p === '50'}>{numberFormat(datum.percentiles[p])}</div>
    </SingleNumberCell>
  {/each}

  <ComparisonCell
    {distributionScaleType}
    {xDomain}
    colorMap={v => percentileLineColorMap(+v)}
    {hovered}
    hoverDistributionValues={datum.histogram}
    referenceDistributionValues={reference.histogram}
    hoverPointValues={datum.transformedPercentiles}
    referencePointValues={reference.transformedPercentiles}
    {isReference} />

</tr>
