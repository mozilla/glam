<script>
import { spring } from 'svelte/motion';
import { fly } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from 'udgl/data-graphics/GraphicBody.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Help from 'udgl/icons/Help.svelte';

import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';

import Springable from 'udgl/data-graphics/motion/Springable.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';

import { window1DPlacement } from 'udgl/data-graphics/utils/window-functions';
import ReferenceSymbol from '../ReferenceSymbol.svelte';
import BuildIDRollover from './BuildIDRollover.svelte';
import TrackingLine from './TrackingLine.svelte';
import TrackingLabel from './TrackingLabel.svelte';

import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

import { aggregationsOverTimeGraph } from '../../utils/constants';

export let title;
export let description;
export let data;
export let markers;
export let metricKeys; // the active keys (eg which percentiles / categories are active)
export let reference;
export let hovered = {};
export let key;
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

function plotValues(xValue, bins, actives, x, y) {
  // transforms to range space, so we can encapsulate
  // in a spring within the template itself.
  // what we need to do is just go by acti
  return actives.map((b) => ({ x: x(xValue), y: y(bins[b]), bin: b }));
}

function createTimeSeries(d, actives, accessor) {
  return actives.map((a) => ({
    bin: a,
    series: d.map((di) => {
      const value = di[accessor][a];
      return {
        y: value,
        x: di.label,
      };
    }),
  }));
}

let xScale;
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

// FIXME: I don't like how this is calculated. It should be
// substantially easier, or should be some kind of helper function
// taken out of this component for reuse.

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

export let hoverValue = {};

let dataGraphicMounted;

$: if (dataGraphicMounted) {
  L.subscribe((l) => { leftPlot = l; });
  R.subscribe((r) => { rightPlot = r; });
}

// handle Ref element hover-over placement.

</script>
<div>
  <h3 style='padding-left: {aggregationsOverTimeGraph.left}px; padding-right: {aggregationsOverTimeGraph.right}px' class=data-graphic__element-title>
    {title} 
    <span use:tooltipAction={
      {
        text: description,
        location: 'top',
}
    } class=data-graphic__element-title__icon><Help size={14} /></span></h3>
 <DataGraphic
  data={data}
  xDomain={xDomain}
  yDomain={yDomain}
  yType={yScaleType}
  xType={xScaleType}
  width={aggregationsOverTimeGraph.width
    - (insufficientData ? aggregationsOverTimeGraph.insufficientDataAdjustment : 0)}
  height={aggregationsOverTimeGraph.height}
  bottom={aggregationsOverTimeGraph.bottom}
  top={aggregationsOverTimeGraph.top}
  left={aggregationsOverTimeGraph.left}
  bottomBorder
  borderColor={aggregationsOverTimeGraph.borderColor}
  bind:rollover={dgRollover}
  bind:hoverValue
  bind:xScale={xScale}
  bind:leftPlot={L}
  bind:rightPlot={R}
  bind:margins={margins}
  right={aggregationsOverTimeGraph.right}
  key={key}
  bind:dataGraphicMounted={dataGraphicMounted}
  on:click
>

<!-- for the additional-plot-elements slot in ProbeExplorer.svelte -->
<g slot=body-background>
  <slot></slot>
</g>

<g slot=background let:top let:bottom let:height let:xScale>
  {#if hovered.datum}
    {#if aggregationLevel === 'build_id'}
        <BuildIDRollover 
          x={hovered.datum.label}
          label={hovered.datum.label}
        />
      {/if}
      <!-- this is the hovered value rect -->
      {#if aggregationLevel === 'build_id'}
      <rect 
        x={hoverLabelPlacement}
        y={top} 
        width={hoverWidth}
        height={bottom - top}
        fill="var(--cool-gray-100)"
      />
      {:else}
      <rect x={xScale(hovered.x) - xScale.step() / 2} y={top} width={xScale.step()} height={bottom - top}
        fill="var(--cool-gray-100)" />
    {/if}
  {/if}
  <!-- this is the reference rect -->

  <rect 
    x={reference}
  />
  <rect
    x={$refLabelSpring} 
    y={top} 
    width={referenceWidth} 
    height={bottom - top}
    fill="var(--cool-gray-100)"
  />
  <Tweenable value={xScale(reference.label)} let:tweenValue>
    <TrackingLine xr={tweenValue} key={reference.label} />
  </Tweenable>
</g>

 <LeftAxis lineStyle=short tickFormatter={yTickFormatter} tickCount=6 />
 
  {#if aggregationLevel === 'build_id'}
    <BottomAxis  />
  {:else}
    {#if xDomain.length <= 5}
      <BottomAxis ticks={xDomain} />
    {:else}
      <BottomAxis />
    {/if}
  {/if}

 <GraphicBody>
   {#each createTimeSeries(data, metricKeys, yAccessor) as {bin, series}, i (bin)}
    <Line 
      lineDrawAnimation={{ duration: 300 }} 
      xAccessor=x
      yAccessor=y
      strokeWidth={strokeWidthMap(bin)}
      color={lineColorMap(bin)}
      data={series} 
      curve=curveStep
    />
   {/each}
 </GraphicBody>

 <g slot=annotation let:top let:bottom let:left let:xScale let:yScale>
  {#if hovered.datum}
    
    <TrackingLine x={hovered.datum.label} />
    <TrackingLabel x={hovered.datum.label} align=top background=white label=Hov. />

    {#each plotValues(hovered.datum.label, hovered.datum[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
        <Springable value={[x, y]} let:springValue>
          <circle 
            cx={x}
            cy={y}
            r=3
            stroke="none"
            fill={lineColorMap(bin)}
          />
        </Springable>
    {/each}
  {/if}
  {#each plotValues(reference.label, reference[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
      <g in:fly={{ duration: 150, y: 100, easing }}>
        <Springable 
          value={[x, y]}
          let:springValue>
            <ReferenceSymbol
              size={25}
              xLocation={springValue[0]} yLocation={springValue[1]} color={lineColorMap(bin)} />
        </Springable>
      </g>
  {/each}

  {#if xScale}
    <Tweenable value={xScale(reference.label)} let:tweenValue>
      <TrackingLabel _bugInSvelteRequiresThisSmallFix={reference.label} yOffset={16} xr={tweenValue} align=top background=white label="Ref." />
    </Tweenable>
  {/if} 

  </g>
  
  <FirefoxReleaseVersionMarkers />

</DataGraphic>
</div>