<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { derived } from "svelte/store";
  import { spring } from "svelte/motion";

  import DataGraphic from "../../../../components/data-graphics/DataGraphic.svelte";
  import TopAxis from "../../../../components/data-graphics/TopAxis.svelte";
  import RightAxis from "../../../../components/data-graphics/RightAxis.svelte";
  import Violin from "../../../../components/data-graphics/ViolinPlotMultiple.svelte";
  import ReferenceSymbol from "./ReferenceSymbol.svelte";

  import { nearestBelow } from "../../../../utils/stats";

  import { twoPointSpring } from "../utils/animation";

  import { explorerComparisonSmallMultiple } from "../utils/constants";

  export let leftDistribution;
  export let rightDistribution;
  export let leftLabel;
  export let rightLabel;
  export let leftPoints;
  export let rightPoints;
  export let activeBins;

  export let yTickFormatter = t => t;
  export let colorMap = () => "black";

  export let yDomain;

  export let xType;
  export let yType;
  export let showViolins = true;
  export let key = Math.random()
    .toString(36)
    .substring(7);
  export let yAccessor = "value";

  const xDomain = ["hovered", "ref."];

  let L;
  let R;
  let T;
  let B;
  let leftPlot;
  let rightPlot;
  let topPlot;
  let bottomPlot;
  let yScale;

  onMount(() => {
    L.subscribe(l => {
      leftPlot = l;
    });
    R.subscribe(r => {
      rightPlot = r;
    });
    T.subscribe(t => {
      topPlot = t;
    });
    B.subscribe(b => {
      bottomPlot = b;
    });
  });

  function placeShapeY(value) {
    if (!yScale) return bottomPlot || explorerComparisonSmallMultiple.height;
    if (yScale.type !== "scalePoint") return yScale(value);
    return yScale(nearestBelow(value, yDomain));
  }

  function getHistValues(d) {
    return d.map(d => d.value);
  }

  let referenceDistSpring;

  if (rightDistribution)
    referenceDistSpring = spring(getHistValues(rightDistribution), {
      damping: 1,
      stiffness: 0.9
    });
  $: if (rightDistribution)
    referenceDistSpring.set(getHistValues(rightDistribution));

  const animatedReferenceDistribution = derived(referenceDistSpring, $d =>
    $d.map((di, i) => ({ value: di, bin: rightDistribution[i].bin }))
  );

  const dotsAndLines = twoPointSpring(
    rightPoints,
    rightPoints,
    placeShapeY,
    colorMap
  );

  $: if (leftPoints) dotsAndLines.setHover(leftPoints);
  $: if (rightPoints) dotsAndLines.setReference(rightPoints);
</script>

<DataGraphic
  {xDomain}
  {yDomain}
  {yType}
  width={explorerComparisonSmallMultiple.width}
  height={explorerComparisonSmallMultiple.height}
  bind:leftPlot={L}
  bind:rightPlot={R}
  bind:topPlot={T}
  bind:bottomPlot={B}
  bind:yScale
  left={explorerComparisonSmallMultiple.left}
  right={explorerComparisonSmallMultiple.right}
  bottom={explorerComparisonSmallMultiple.bottom}
  {key}>
  <rect
    x={leftPlot}
    y={topPlot}
    width={rightPlot - leftPlot}
    height={bottomPlot - topPlot}
    fill="var(--cool-gray-200)"
    opacity=".25" />
  <RightAxis tickFormatter={yTickFormatter} tickCount="6" />
  <TopAxis ticks={xDomain} />

  {#if leftPoints && rightPoints}
    {#each activeBins as bin, i}
      <line
        x1={leftPlot}
        x2={rightPlot}
        y1={$dotsAndLines[bin].leftY}
        y2={$dotsAndLines[bin].rightY}
        stroke={$dotsAndLines[bin].color}
        stroke-width="2" />
      <circle
        cx={leftPlot}
        cy={$dotsAndLines[bin].leftY}
        r="3"
        fill={$dotsAndLines[bin].color} />
    {/each}
  {/if}
  {#each activeBins as bin, i}
    <ReferenceSymbol
      xLocation={rightPlot}
      yLocation={$dotsAndLines[bin].rightY}
      color={$dotsAndLines[bin].color} />
  {/each}

  {#if leftDistribution && showViolins}
    <g in:fade={{ duration: 50 }}>
      <Violin
        orientation="vertical"
        showLeft={false}
        rawPlacement={(rightPlot - leftPlot) / 2 + leftPlot - 1}
        key={leftLabel}
        opacity=".9"
        density={leftDistribution}
        densityAccessor="value"
        valueAccessor="bin"
        densityRange={[0, 30]}
        areaColor="var(--digital-blue-400)"
        lineColor="var(--digital-blue-500)" />
    </g>
  {/if}
  {#if rightDistribution && showViolins}
    <Violin
      orientation="vertical"
      showRight={false}
      rawPlacement={(rightPlot - leftPlot) / 2 + leftPlot + 1}
      opacity=".9"
      key={rightLabel}
      density={$animatedReferenceDistribution}
      densityAccessor="value"
      valueAccessor="bin"
      densityRange={[0, 30]}
      areaColor="var(--digital-blue-400)"
      lineColor="var(--digital-blue-500)" />
  {/if}

</DataGraphic>
