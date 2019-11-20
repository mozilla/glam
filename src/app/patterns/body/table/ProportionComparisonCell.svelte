<script>
  import { spring, tweened } from "svelte/motion";
  import { cubicOut as easing } from "svelte/easing";
  import DataGraphic from "../../../../components/data-graphics/DataGraphic.svelte";
  import TopAxis from "../../../../components/data-graphics/TopAxis.svelte";
  import Violin from "../../../../components/data-graphics/ViolinPlotMultiple.svelte";
  import ReferenceSymbol from "../elements/ReferenceSymbol.svelte";

  import { comparisonSmallMultiple } from "../utils/constants";

  export let xDomain;
  export let distributionScaleType;
  export let colorMap;
  export let hovered = false;
  export let isReference = false;
  export let activeBuckets = [];

  export let hoverPointValues;
  export let referencePointValues;

  let distributionXScale;
  let yScale;
  function removeInactiveBuckets(pt) {
    const out = { ...pt };
    Object.keys(out).forEach(pti => {
      if (!activeBuckets.includes(pti)) delete out[pti];
    });
    return out;
  }

  function addCoordinates(pt, flattenDist = 0) {
    const pt2 = { values: { ...pt }, coords: {} };
    pt2.values = removeInactiveBuckets(pt2.values);
    Object.keys(pt2.values).forEach(k => {
      pt2.coords[k] = {};
      pt2.coords[k].x = distributionXScale
        ? distributionXScale(pt2.values[k])
        : 0;
      pt2.coords[k].y = yScale && !flattenDist ? yScale(k) : flattenDist;
    });
    return pt2;
  }

  const hoverSpring = tweened(addCoordinates(hoverPointValues), {
    duration: 200,
    easing
  });
  $: if (yScale && distributionXScale && hoverPointValues)
    hoverSpring.set(addCoordinates(hoverPointValues));
  const referenceSpring = spring(removeInactiveBuckets(referencePointValues), {
    damping: 0.4,
    stiffness: 0.9
  });

  $: referenceSpring.set(removeInactiveBuckets(referencePointValues));
</script>

<td class="data-cell--graphic">
  <DataGraphic
    width={comparisonSmallMultiple.width}
    height={comparisonSmallMultiple.height}
    left={comparisonSmallMultiple.left}
    right={comparisonSmallMultiple.right}
    top={0}
    bottom={0}
    bind:xScale={distributionXScale}
    bind:yScale
    {xDomain}
    yDomain={Object.keys(removeInactiveBuckets(referencePointValues))}
    yType="scalePoint"
    xType={distributionScaleType}
    yPadding={0.8}>
    <TopAxis tickCount="6" lineStyle="long" />
    {#if distributionXScale}
      {#each Object.keys($hoverSpring.values) as p, i}
        <circle
          opacity={hovered ? 1 : 0.6}
          cx={$hoverSpring.coords[p].x}
          cy={$hoverSpring.coords[p].y}
          r="2"
          fill={colorMap(p)} />
        <line
          x1={distributionXScale(0)}
          x2={$hoverSpring.coords[p].x}
          y1={$hoverSpring.coords[p].y}
          y2={$hoverSpring.coords[p].y}
          stroke-dasharray="3,1"
          opacity={hovered ? 0.5 : 1}
          stroke={colorMap(p)} />
      {/each}
      {#if hovered}
        {#each Object.keys($hoverSpring.values) as p, i}
          <!-- <line
              x1={$hoverSpring.coords[p].x}
              x2={distributionXScale($referenceSpring[p])}
              y1={$hoverSpring.coords[p].y}
              y2={comparisonSmallMultiple.height - 6}
              stroke={colorMap(p)}
            /> -->
          <line
            x1={$hoverSpring.coords[p].x}
            x2={distributionXScale($referenceSpring[p])}
            y1={$hoverSpring.coords[p].y}
            y2={$hoverSpring.coords[p].y}
            stroke={colorMap(p)} />

          <!-- <ReferenceSymbol
              xLocation={distributionXScale($referenceSpring[p])} 
              yLocation={comparisonSmallMultiple.height - 6} 
              color={colorMap(p)} /> -->
          <ReferenceSymbol
            size={20}
            xLocation={distributionXScale($referenceSpring[p])}
            yLocation={$hoverSpring.coords[p].y}
            color={colorMap(p)} />
        {/each}
      {/if}
    {/if}
  </DataGraphic>
</td>
