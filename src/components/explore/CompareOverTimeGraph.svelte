<script>
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from 'udgl/data-graphics/GraphicBody.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Help from 'udgl/icons/Help.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';

import { window1DPlacement, window1D } from 'udgl/data-graphics/utils/window-functions';
import ReferenceSymbol from '../ReferenceSymbol.svelte';
import BuildIDRollover from './BuildIDRollover.svelte';

import { cartesianCoordSpring } from '../../utils/animation';

import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

import { buildIDComparisonGraph } from '../../utils/constants';

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
export let xScaleType = 'scalePoint';
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

let transformedData = [];

$: transformedData = transform(metricKeys, data)
  .map((ps, i) => [ps, metricKeys[i]]);

let xScale;
let yScale;
let H;
let T;
let B;
let L;
let R;
let bodyHeight;
let topPlot;
let leftPlot;
let rightPlot;
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
let referenceWidth;
let hoverLabelPlacement = 0;
let hoverWidth;

function determinePlacementOfBackgroundFill(datum) {
  let refWidth;
  let refLabel;
  if (aggregationLevel === 'version') {
    refWidth = xScale.step();
    refLabel = xScale(datum.label) - refWidth / 2;
  }
  if (aggregationLevel === 'build_id') {
    if (data.length > 1) {
      const { rangeStart, rangeEnd } = window1DPlacement({
        data,
        value: datum.label,
        lowValue: xDomain[0],
        highValue: xDomain[1],
        scale: xScale,
      });

      refWidth = rangeEnd - rangeStart;
      refLabel = rangeStart;
    } else {
      refWidth = rightPlot - leftPlot;
      refLabel = leftPlot - (rightPlot - leftPlot) / 2;
    }
  }
  return [refWidth, refLabel];
}


$: if (xScale && rightPlot) {
  [referenceWidth, refLabelPlacement] = determinePlacementOfBackgroundFill(reference);
}

$: if (hovered.datum && xScale) {
  [hoverWidth, hoverLabelPlacement] = determinePlacementOfBackgroundFill(hovered.datum);
}

const refLabelSpring = spring(refLabelPlacement, { damping: 0.9, stiffness: 0.3 });
$: if (refLabelPlacement) refLabelSpring.set(refLabelPlacement);

function initiateRollover(rolloverStore) { // eslint-disable-line
  if (!rolloverStore || !hoverActive) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    let datum;
    let prior;
    let next;
    if (aggregationLevel === 'build_id') {
      const windowSet = !x ? { previous: undefined, current: undefined, next: undefined }
        : window1D({
          data, value: x, label: 'label', lowestValue: xDomain[0], highestValue: xDomain[1],
        });
      datum = windowSet.current;
      prior = windowSet.previous;
      next = windowSet.next;

      return {
        x, y, datum, prior, next,
      };
    }
    // version is scalePoint
    datum = data.find((d) => d.label === x);
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
  R.subscribe((r) => { rightPlot = r; });
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
<div>
  <h3 style='padding-left: {buildIDComparisonGraph.left}px; padding-right: {buildIDComparisonGraph.right}px' class=data-graphic__element-title>
    Over Time 
    <span use:tooltipAction={
      'hover to compare to reference ⭑; click to set reference ⭑ to hovered value ●',
      { location: 'top' }
    } class=data-graphic__element-title__icon><Help size={14} /></span></h3>
 <DataGraphic
 data={data}
 xDomain={xDomain}
 yDomain={yDomain}
 yType={yScaleType}
 xType={xScaleType}
 width={buildIDComparisonGraph.width
  - (insufficientData ? buildIDComparisonGraph.insufficientDataAdjustment : 0)}
 height={buildIDComparisonGraph.height}
 bottom={buildIDComparisonGraph.bottom}
 top={buildIDComparisonGraph.top}
 left={buildIDComparisonGraph.left}
 bind:rollover={dgRollover}
 bind:xScale={xScale}
 bind:yScale={yScale}
 bind:bodyHeight={H}
 bind:topPlot={T}
 bind:leftPlot={L}
 bind:rightPlot={R}
 bind:bottomPlot={B}
 bind:margins={margins}
 right={buildIDComparisonGraph.right}
 key={key}
 bind:dataGraphicMounted={dataGraphicMounted}
 on:click={() => {
   if (hovered.datum) {
     reference = hovered.datum;
   }
 }}
>

<!-- for the additional-plot-elements slot in ProbeExplorer.svelte -->
<g slot=body-background>
  <slot></slot>
</g>

{#if hovered.datum && xScale && topPlot && bodyHeight}
 {#if aggregationLevel === 'build_id'}
    <BuildIDRollover 
      x={hovered.x}
      label={hovered.datum.label}
    />
  {/if}
  <!-- this is the hovered value rect -->
  {#if aggregationLevel === 'build_id'}
  <rect 
    x={hoverLabelPlacement}
    y={topPlot} 
    width={hoverWidth}
    height={bodyHeight}
    fill="var(--cool-gray-100)"
  />
  {:else}
  <rect x={xScale(hovered.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
    fill="var(--cool-gray-100)" />
  {/if}
  

  {/if}

  <!-- this is the reference rect -->
    <rect
      bind:this={referenceBackgroundElement}
      x={$refLabelSpring} 
      y={topPlot} 
      width={referenceWidth} 
      height={bodyHeight}
      fill="var(--cool-gray-100)"
    />
  
 <LeftAxis tickFormatter={yTickFormatter} tickCount=6 />
 
 {#if aggregationLevel === 'build_id'}
  <BottomAxis  />
{:else}
  <BottomAxis ticks={xDomain} />
{/if}

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
        ? Math.max($refLabelSpring - margins.buffer, leftPlot + refTextWidth + margins.buffer)
        : $refLabelSpring + margins.buffer} 
      y={topPlot + 11 + margins.buffer} 
      fill={hovered.datum ? 'var(--cool-gray-500)' : 'var(--cool-gray-400)'}>ref.</text>
  {/if}

  <FirefoxReleaseVersionMarkers />
</DataGraphic>
</div>