<script>
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import LeftAxis from '../../../../components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../../components/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import BuildIDRollover from '../../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../../components/data-graphics/shapes/Line.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';

import { cartesianCoordSpring } from '../utils/animation';

import FirefoxReleaseVersionMarkers from '../elements/FirefoxReleaseVersionMarkers.svelte';

import { buildIDComparisonGraph } from '../utils/constants';

import {
  firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../utils/build-id-utils';

export let data;
export let markers;
export let metricKeys;
export let reference;
export let hovered = {};
export let key;
export let transform;
export let lineColorMap = () => 'gray';
export let strokeWidthMap = () => 1;
export let extractMouseoverValues;
export let xDomain;
export let yDomain;
export let yScaleType;
export let yTickFormatter;
export let timeHorizon;
export let aggregationLevel; // build_id or version.
// if !hoverActive, do not allow hovering.
export let hoverActive = true;
// if data.length < 2, then suppress this graph.
export let insufficientData = false;

let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

// FIXME: add version tick formatter;
$: if (aggregationLevel === 'build_id') {
  if (timeHorizon === 'ALL_TIME') {
    tickFormatter = buildIDToMonth;
    ticks = firstOfMonth;
  } else if (timeHorizon === 'MONTH') {
    tickFormatter = buildIDToMonth;
    ticks = mondays;
  } else {
    tickFormatter = buildIDToMonth;
    ticks = getFirstBuildOfDays;
  }
} else {
  ticks = xDomain;
  tickFormatter = (v) => v;
}

let transformedData = [];

$: transformedData = transform(metricKeys, data.filter((d) => xDomain.includes(d.label)))
  .map((ps, i) => [ps, metricKeys[i]]);


let xScale;
let yScale;
let H;
let T;
let B;
let L;
let bodyHeight;
let topPlot;
let leftPlot;
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
  placeShapeY,
  { stiffness: 0.4, damping: 0.8 },
);

const hoverPoints = cartesianCoordSpring(
  extractMouseoverValues(reference),
  placeShapeX,
  placeShapeY,
  { stiffness: 0.9, damping: 0.9 },
);

$: if (xScale && yScale) {
  referencePoints.setValue(extractMouseoverValues(reference));
  hoverPoints.setValue(extractMouseoverValues(hovered.datum ? hovered.datum : reference));
}
$: if (reference) referencePoints.setValue(extractMouseoverValues(reference));
$: if (hovered.datum) hoverPoints.setValue(extractMouseoverValues(hovered.datum));

// let's make the current reference label spring.
let refLabelPlacement = 0;
$: refLabelPlacement = xScale ? xScale(reference.label) : 0;
const refLabelSpring = spring(refLabelPlacement, { damping: 0.9, stiffness: 0.3 });
$: refLabelSpring.set(refLabelPlacement);


function initiateRollover(rolloverStore) { // eslint-disable-line
  if (!rolloverStore || !hoverActive) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    // we need the whole data point?
    // use only x to fetch the data point.
    const datum = data.find((d) => d.label === x);
    return { x, y, datum };
  }).subscribe((st) => {
    hovered = st;
  });
}

let dataGraphicMounted;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  B.subscribe((b) => { bottomPlot = b; });
  H.subscribe((h) => { bodyHeight = h; });
  L.subscribe((l) => { leftPlot = l; });
}

// handle Ref element hover-over placement.
let referenceTextElement;
let referenceBackgroundElement;
let refTextPlacement = 'outside';
let refTextSpace = 8;
let refTextWidth = 0;
let refBGWidth = 0;
$: if (referenceTextElement && referenceBackgroundElement) {
  refTextWidth = referenceTextElement.getBoundingClientRect().width;
  refBGWidth = referenceBackgroundElement.getBoundingClientRect().width;
  if (refTextWidth + refTextSpace * 2 <= refBGWidth) {
    refTextPlacement = 'inside';
  }
}

</script>

 <DataGraphic
 data={data}
 xDomain={xDomain}
 yDomain={yDomain}
 yType={yScaleType}
 width={buildIDComparisonGraph.width
  - (insufficientData ? buildIDComparisonGraph.insufficientDataAdjustment : 0)}
 height={buildIDComparisonGraph.height}
 bottom={buildIDComparisonGraph.bottom}
 bind:rollover={dgRollover}
 bind:xScale={xScale}
 bind:yScale={yScale}
 bind:bodyHeight={H}
 bind:topPlot={T}
 bind:leftPlot={L}
 bind:bottomPlot={B}
 bind:margins={margins}
 right={buildIDComparisonGraph.right}
 key={key}
 bind:dataGraphicMounted={dataGraphicMounted}
 on:click={() => {
   if (hovered.datum) reference = hovered.datum;
 }}
>

{#if hovered.x && xScale && topPlot && bodyHeight}
 {#if aggregationLevel === 'build_id'}
    <BuildIDRollover 
      x={hovered.x}
      label={hovered.datum.label}
    />
  {/if}
  <!-- this is the hovered value rect -->
  <rect x={xScale(hovered.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
    fill="var(--cool-gray-100)" />

  {/if}
  <!-- this is the reference rect -->
  <rect
    bind:this={referenceBackgroundElement}
    x={$refLabelSpring - xScale.step() / 2} 
    y={topPlot} 
    width={xScale.step()} 
    height={bodyHeight}
    fill="var(--cool-gray-100)" />
  
 <LeftAxis tickFormatter={yTickFormatter} tickCount=6 />
 <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />

 <!-- <TopAxis showLabels=false showBorder=true /> -->

 <GraphicBody>
   {#each transformedData as
     [lineData, key], i (key)}
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
    r=2
    stroke="none"
    fill={lineColorMap(bin)}
    />
  {/each}

 {/if}
 {#each metricKeys as bin, i (bin)}
    <ReferenceSymbol
    size={20}
    xLocation={$referencePoints[bin].x} yLocation={$referencePoints[bin].y} color={lineColorMap(bin)} 
  />
  {/each}
  {#if xScale}
    <!-- FIXME: let's not do all this calculation in the template itself. -->
    <text
      bind:this={referenceTextElement}
      text-anchor={refTextPlacement === 'outside' ? 'end' : 'start'}
      font-size=11
      style='
        text-transform: uppercase;
        text-shadow: 
          -3px 0px 3px rgba(255,255,255, 1),
           3px 0px 0px rgba(255,255,255, 1),
          0px 3px 0px rgba(255,255,255, 1),
          0px -3px 0px rgba(255,255,255, 1),
          -3px -3px 0px rgba(255,255,255, 1),
          3px -3px 0px rgba(255,255,255, 1),
          3px 3px 0px rgba(255,255,255, 1),
          -3px 3px 0px rgba(255,255,255, 1);'
      x={
        refTextPlacement === 'outside'
        ? Math.max($refLabelSpring - margins.buffer - xScale.step(), leftPlot + refTextWidth + margins.buffer)
        : $refLabelSpring - xScale.step() / 2 + margins.buffer} 
      y={topPlot + 11 + margins.buffer} 
      fill={hovered.datum ? 'var(--cool-gray-500)' : 'var(--cool-gray-400)'}>ref.</text>
  {/if}

  <FirefoxReleaseVersionMarkers />

</DataGraphic>