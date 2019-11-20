<script>
  import { spring } from "svelte/motion";
  import { derived } from "svelte/store";

  import DataGraphic from "../../../../components/data-graphics/DataGraphic.svelte";
  import LeftAxis from "../../../../components/data-graphics/LeftAxis.svelte";
  import BottomAxis from "../../../../components/data-graphics/BottomAxis.svelte";
  import GraphicBody from "../../../../components/data-graphics/GraphicBody.svelte";
  import BuildIDRollover from "../../../../components/data-graphics/rollovers/BuildIDRollover.svelte";
  import Line from "../../../../components/data-graphics/LineMultiple.svelte";
  import ReferenceSymbol from "./ReferenceSymbol.svelte";

  import { cartesianCoordSpring } from "../utils/animation";

  import FirefoxReleaseVersionMarkers from "./FirefoxReleaseVersionMarkers.svelte";

  import { buildIDComparisonGraph } from "../utils/constants";

  import {
    firstOfMonth,
    buildIDToMonth,
    mondays,
    getFirstBuildOfDays
  } from "../../../../components/data-graphics/utils/build-id-utils";

  export let data;
  export let markers;
  export let metricKeys;
  export let reference; // used to be latest
  export let hovered = {};
  export let key; // ???????
  export let transform; // extractPercentiles?
  export let lineColorMap = () => "gray"; // percentileLineColorMap
  export let strokeWidthMap = () => 1; // percentileLineStrokewidthMap
  export let extractMouseoverValues;
  export let xDomain;
  export let yDomain;
  export let yScaleType;
  export let yTickFormatter;
  export let timeHorizon;

  let tickFormatter = buildIDToMonth;
  let ticks = firstOfMonth;

  $: if (timeHorizon === "ALL_TIME") {
    tickFormatter = buildIDToMonth;
    ticks = firstOfMonth;
  } else if (timeHorizon === "MONTH") {
    tickFormatter = buildIDToMonth;
    ticks = mondays;
  } else {
    tickFormatter = buildIDToMonth;
    ticks = getFirstBuildOfDays;
  }

  let transformedData = [];

  $: transformedData = transform(
    metricKeys,
    data.filter(d => xDomain.includes(d.label))
  ).map((ps, i) => [ps, metricKeys[i]]);

  let xScale;
  let yScale;
  let H;
  let T;
  let B;
  let bodyHeight;
  let topPlot;
  let bottomPlot;
  let dgRollover;
  let margins;

  // FIXME: this is kind of a confusing pattern
  function placeShapeY(value) {
    if (!yScale) return bottomPlot || buildIDComparisonGraph.height;
    return yScale(value);
  }

  function placeShapeX(value) {
    if (!yScale) return buildIDComparisonGraph.width;
    return xScale(value);
  }

  const referencePoints = cartesianCoordSpring(
    extractMouseoverValues(reference),
    placeShapeX,
    placeShapeY
  );

  const hoverPoints = cartesianCoordSpring(
    extractMouseoverValues(reference),
    placeShapeX,
    placeShapeY,
    { stiffness: 0.9, damping: 0.9 }
  );

  $: if (xScale && yScale) {
    referencePoints.setValue(extractMouseoverValues(reference));
    hoverPoints.setValue(
      extractMouseoverValues(hovered.datum ? hovered.datum : reference)
    );
  }
  $: if (reference) referencePoints.setValue(extractMouseoverValues(reference));
  $: if (hovered.datum)
    hoverPoints.setValue(extractMouseoverValues(hovered.datum));

  // let's make the current reference label spring.
  let refLabelPlacement = 0;
  $: refLabelPlacement = xScale ? xScale(reference.label) : 0;
  const refLabelSpring = spring(refLabelPlacement, {
    damping: 0.9,
    stiffness: 0.3
  });
  $: refLabelSpring.set(refLabelPlacement);

  function initiateRollover(rolloverStore) {
    // eslint-disable-line
    if (!rolloverStore) return undefined;
    derived(rolloverStore, ({ x, y }) => {
      // we need the whole data point?
      // use only x to fetch the data point.
      const datum = data.find(d => d.label === x);
      return { x, y, datum };
    }).subscribe(st => {
      hovered = st;
    });
  }

  let dataGraphicMounted;

  $: if (dataGraphicMounted) {
    initiateRollover(dgRollover);
    T.subscribe(t => {
      topPlot = t;
    });
    B.subscribe(b => {
      bottomPlot = b;
    });
    H.subscribe(h => {
      bodyHeight = h;
    });
  }
</script>

<DataGraphic
  {data}
  {xDomain}
  {yDomain}
  yType={yScaleType}
  width={buildIDComparisonGraph.width}
  height={buildIDComparisonGraph.height}
  bottom={buildIDComparisonGraph.bottom}
  bind:rollover={dgRollover}
  bind:xScale
  bind:yScale
  bind:bodyHeight={H}
  bind:topPlot={T}
  bind:bottomPlot={B}
  bind:margins
  right={buildIDComparisonGraph.right}
  {key}
  bind:dataGraphicMounted
  on:click={() => {
    if (hovered.datum) reference = hovered.datum;
  }}>

  {#if hovered.x && xScale && topPlot && bodyHeight}
    <BuildIDRollover x={hovered.x} label={hovered.datum.label} />

    <rect
      x={xScale(hovered.x) - xScale.step() / 2}
      y={topPlot}
      width={xScale.step()}
      height={bodyHeight}
      fill="var(--cool-gray-100)" />
  {/if}
  <rect
    x={$refLabelSpring - xScale.step() / 2}
    y={topPlot}
    width={xScale.step()}
    height={bodyHeight}
    fill="var(--cool-gray-100)" />
  <LeftAxis tickFormatter={yTickFormatter} tickCount="6" />
  <BottomAxis {ticks} {tickFormatter} />

  <!-- <TopAxis showLabels=false showBorder=true /> -->

  <GraphicBody>
    {#each transformedData as [lineData, key], i (key)}
      <Line
        curve="curveStep"
        lineDrawAnimation={{ duration: 300 }}
        xAccessor="label"
        yAccessor={'value'}
        strokeWidth={strokeWidthMap(key)}
        color={lineColorMap(key)}
        data={lineData} />
    {/each}
  </GraphicBody>

  {#if hovered.datum && extractMouseoverValues}
    {#each metricKeys as bin, i (bin)}
      <circle
        cx={$hoverPoints[bin].x}
        cy={$hoverPoints[bin].y}
        r="2"
        stroke="none"
        fill={lineColorMap(bin)} />
    {/each}
  {/if}
  {#each metricKeys as bin, i (bin)}
    <ReferenceSymbol
      size={20}
      xLocation={$referencePoints[bin].x}
      yLocation={$referencePoints[bin].y}
      color={lineColorMap(bin)} />
  {/each}
  {#if xScale}
    <text
      text-anchor="end"
      font-size="11"
      style="text-transform: uppercase;"
      x={$refLabelSpring - margins.buffer - xScale.step() / 2}
      y={topPlot + margins.buffer}
      fill={hovered.datum ? 'var(--cool-gray-500)' : 'var(--cool-gray-300)'}>
      ref.
    </text>
  {/if}

  <FirefoxReleaseVersionMarkers />

</DataGraphic>
