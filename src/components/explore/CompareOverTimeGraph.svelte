<script>
import { spring } from 'svelte/motion';

import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from 'udgl/data-graphics/GraphicBody.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Help from 'udgl/icons/Help.svelte';

import Springable from 'udgl/data-graphics/motion/Springable.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';

import { window1DPlacement, window1D } from 'udgl/data-graphics/utils/window-functions';
import ReferenceSymbol from '../ReferenceSymbol.svelte';
import BuildIDRollover from './BuildIDRollover.svelte';

import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

import { buildIDComparisonGraph } from '../../utils/constants';

export let data;
export let markers;
export let metricKeys; // the active keys (eg which percentiles / categories are active)
export let reference;
export let hovered = {};
export let key;
export let transform;
export let lineColorMap = () => 'gray';
export let strokeWidthMap = () => 1;
export let yAccessor;
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

function plotValues(xValue, bins, actives, x, y) {
  // transforms to range space, so we can encapsulate
  // in a spring within the template itself.
  // what we need to do is just go by acti
  return actives.map((b) => ({ x: x(xValue), y: y(bins[b]), bin: b }));
}

let xScale;
let yScale;
let L;
let R;
let leftPlot;
let rightPlot;
let dgRollover;
let margins;

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

const refLabelSpring = spring(refLabelPlacement, { damping: 0.9, stiffness: 0.3 });
$: if (refLabelPlacement) refLabelSpring.set(refLabelPlacement);


let hoverValue = {};
$: if (hoverValue.x) {
  const i = window1D({
    data, value: hoverValue.x, lowestValue: xDomain[0], highestValue: xDomain[1],
  });
  hovered = {
    ...hoverValue,
    datum: data[i.currentIndex],
    previous: data[i.previousIndex],
    next: data[i.nextIndex],
  };
} else {
  hovered = {};
}

let dataGraphicMounted;

$: if (dataGraphicMounted) {
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
  bind:hoverValue
  bind:xScale={xScale}
  bind:yScale={yScale}
  bind:leftPlot={L}
  bind:rightPlot={R}
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

<g slot=background let:top let:height let:xScale>
{#if hovered.datum}
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
        y={top} 
        width={hoverWidth}
        height={height}
        fill="var(--cool-gray-100)"
      />
      {:else}
      <rect x={xScale(hovered.x) - xScale.step() / 2} y={top} width={xScale.step()} height={height}
        fill="var(--cool-gray-100)" />
      {/if}
    {/if}
    <!-- this is the reference rect -->

    <rect 
      x={reference}
    />
    <rect
      bind:this={referenceBackgroundElement}
      x={$refLabelSpring} 
      y={top} 
      width={referenceWidth} 
      height={height}
      fill="var(--cool-gray-100)"
    />
  </g>

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
        data={lineData} 
      />
     {/each}
 </GraphicBody>

 <g slot=annotation let:top let:left let:xScale let:yScale>
  {#if hovered.datum}
  {#each plotValues(hovered.datum.label, hovered.datum[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
      <Springable value={[x, y]} let:springValue>
        <circle 
          cx={x}
          cy={y}
          r=2
          stroke="none"
          fill={lineColorMap(bin)}
        />
      </Springable>
  {/each}
  {/if}
  {#each plotValues(reference.label, reference[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
      <Springable value={[x, y]} let:springValue>
        <ReferenceSymbol
          size={20}
          xLocation={springValue[0]} yLocation={springValue[1]} color={lineColorMap(bin)} />
      </Springable>
  {/each}

  {#if xScale}
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
        ? Math.max($refLabelSpring - margins.buffer, left + refTextWidth + margins.buffer)
        : $refLabelSpring + margins.buffer} 
      y={top + 11 + margins.buffer} 
      fill={hovered.datum ? 'var(--cool-gray-500)' : 'var(--cool-gray-400)'}>ref.</text>
  {/if}

  </g>
  
  <FirefoxReleaseVersionMarkers />

</DataGraphic>
</div>