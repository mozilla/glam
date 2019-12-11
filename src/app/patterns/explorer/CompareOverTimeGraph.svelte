<script>
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

import DataGraphic from '../../../components/data-graphics/DataGraphic.svelte';
import LeftAxis from '../../../components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../components/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from '../../../components/data-graphics/GraphicBody.svelte';
import BuildIDRollover from '../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../components/data-graphics/elements/Line.svelte';
import ReferenceSymbol from '../elements/ReferenceSymbol.svelte';

import { cartesianCoordSpring } from '../utils/animation';

import FirefoxReleaseVersionMarkers from '../elements/FirefoxReleaseVersionMarkers.svelte';

import { buildIDComparisonGraph } from '../utils/constants';

import {
  firstOfMonth, buildIDToMonth,
} from '../utils/build-id-utils';

export let data;
export let markers;
export let metricKeys;
export let reference;
// use these for build id charts. We will need the prior and
// next points
let priorReference;
let nextReference;
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

let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

// FIXME: add version tick formatter;
// $: if (aggregationLevel === 'build_id') {
//   if (timeHorizon === 'ALL_TIME') {
//     tickFormatter = buildIDToMonth;
//     ticks = firstOfMonth;
//   } else if (timeHorizon === 'MONTH') {
//     tickFormatter = buildIDToMonth;
//     ticks = mondays;
//   } else {
//     tickFormatter = buildIDToMonth;
//     ticks = getFirstBuildOfDays;
//   }
// } else {
//   ticks = xDomain;
//   tickFormatter = (v) => v;
// }

let transformedData = [];

$: transformedData = transform(metricKeys, data)// data.filter((d) => xDomain.includes(d.label)))
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

// bisection
/* eslint-disable */
function c(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function b(a, x, key='label', lo = 0, hi = a.length) {
  while (lo < hi) {
    let mid = lo + hi >>> 1;
    if (c(+a[mid][key], x) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function g(d, v, key='label', domain) {
   if (v < d[0][key]) return { ...d[0], index: 0 };
  const index = b(d, v);
  const lb = b(d, domain[0]);
  const hb = b(d, domain[1]);
  if (index < lb || index > hb) return undefined;
  const prior = index - 1;
  let midpoint = 0;
  let px;
  let ix;
  if (d[prior]) {
    px = +d[prior][key];
    ix = +d[index][key];
    midpoint = (ix - px) / 2;
  }
  if (v < (d[index][key] - midpoint)) return { ...d[prior], index: prior };
  return { ...d[index], index };
}

/* eslint-enable */


// let's make the current reference label spring.
let refLabelPlacement = 0;
let referenceWidth;
let hoverLabelPlacement = 0;
let hoverWidth;

// FIXME: we should find a nicer set of primitives to make refLabelSpring work.
// this feels like a lot of work.
// figure out the reference label spring values.
function determinePlacementOfBackgroundFill(datum) {
  let refWidth;
  let refLabel;
  if (aggregationLevel === 'version') {
    refWidth = xScale.step();
    refLabel = xScale(datum.label) - refWidth / 2;
  }
  if (aggregationLevel === 'build_id') {
    if (data.length > 1) {
      const refPoint = g(data, datum.label, 'label', xDomain);
      let r;
      let prior;
      let next;
      let rightEnd = false;
      if (!refPoint) {
        prior = xScale(data[datum.index]);
        next = xScale(data[prior + 1]);
        // set referenceWidth here.
      } else {
        r = refPoint.index;
        prior = data[r].label <= xDomain[0] ? leftPlot : xScale(data[r - 1].label);
        next = (data[r].label >= xDomain[1] || (r === data.length - 1)) ? rightPlot : xScale(data[r + 1].label);
        rightEnd = data[r].label >= xDomain[1];
      }
      refWidth = (next - prior) / 2;
      refLabel = prior + refWidth / (2 * rightEnd ? 1 : 2);
    } else {
      refWidth = rightPlot - leftPlot;
      refLabel = leftPlot - (rightPlot - leftPlot) / 2;
    }
  }
  return [refWidth, refLabel];
}


$: if (xDomain && xScale && rightPlot) {
  [referenceWidth, refLabelPlacement] = determinePlacementOfBackgroundFill(reference);
}

$: if (xDomain && hovered.datum && xScale) [hoverWidth, hoverLabelPlacement] = determinePlacementOfBackgroundFill(hovered.datum);

const refLabelSpring = spring(refLabelPlacement, { damping: 0.9, stiffness: 0.3 });
$: if (refLabelPlacement) refLabelSpring.set(refLabelPlacement);

function initiateRollover(rolloverStore) { // eslint-disable-line
  if (!rolloverStore || !hoverActive) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    let datum;
    let prior;
    let next;
    if (aggregationLevel === 'build_id') {
      // build_id requires bisection
      datum = !x ? undefined : g(data, x, 'label', xDomain);
      if (datum) {
        prior = data[datum.index - 1];
        next = datum.index < data.length ? data[datum.index + 1] : datum;
      }
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
     if (aggregationLevel === 'build_id') {
       priorReference = hovered.prior;
       nextReference = hovered.next;
     }
   }
 }}
>

{#if hovered.datum && xScale && topPlot && bodyHeight}
 {#if aggregationLevel === 'build_id'}
    <BuildIDRollover 
      x={hovered.x}
      label={hovered.datum.label}
    />
  {/if}
  <!-- this is the hovered value rect -->
  {#if aggregationLevel === 'build_id'}
  <!-- <rect 
    x={(xScale(hovered.prior.label)) + ((hovered.next ? xScale(hovered.next.label) : rightPlot) - xScale(hovered.prior.label)) / 4}
    y={topPlot} 
    width={((hovered.next ? xScale(hovered.next.label) : rightPlot * 2) - (xScale(hovered.prior.label))) / 2}
    height={bodyHeight}
    fill="var(--cool-gray-100)"
  /> -->
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
  
  {#if aggregationLevel === 'build_id'}
    <rect
      bind:this={referenceBackgroundElement}
      x={$refLabelSpring} 
      y={topPlot} 
      width={referenceWidth} 
      height={bodyHeight}
      fill="var(--cool-gray-100)" />
    {:else}
    <rect
      bind:this={referenceBackgroundElement}
      x={$refLabelSpring} 
      y={topPlot} 
      width={referenceWidth} 
      height={bodyHeight}
      fill="var(--cool-gray-100)" />
    {/if}
 <LeftAxis tickFormatter={yTickFormatter} tickCount=6 />
 
 {#if aggregationLevel === 'build_id'}
  <BottomAxis  />
{:else}
  <BottomAxis ticks={xDomain} />
{/if}

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
        ? Math.max($refLabelSpring - margins.buffer, leftPlot + refTextWidth + margins.buffer)
        : $refLabelSpring + margins.buffer} 
      y={topPlot + 11 + margins.buffer} 
      fill={hovered.datum ? 'var(--cool-gray-500)' : 'var(--cool-gray-400)'}>ref.</text>
  {/if}

  <FirefoxReleaseVersionMarkers />

</DataGraphic>