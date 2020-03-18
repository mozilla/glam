<script>
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import Help from 'udgl/icons/Help.svelte';

import CompareClientCounts from './CompareClientCounts.svelte';
import ReferenceSymbol from '../ReferenceSymbol.svelte';

import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';
import { formatCount } from '../../utils/formatters';

import { totalClientsGraph, tween } from '../../utils/constants';

import {
  clientCounts,
} from '../../utils/probe-utils';


export let data;
export let xDomain;
export let timeHorizon;
export let reference;
export let hovered;

let margins;


let transformed = clientCounts(data);
$: transformed = clientCounts(data);

let yScale;
let xScale;

// if

const MULT = 1.1;
let yVals = transformed.map((d) => d.totalClients);
$: yVals = transformed.map((d) => d.totalClients);
let yMax = Math.max(...yVals);
$: yMax = Math.max(50, Math.max(...yVals));
let yDomain;
$: yDomain = [0, yMax * MULT];

let dataGraphicMounted;
let L;
let T;
let BW;
let BH;
let bodyWidth;
let bodyHeight;

$: if (dataGraphicMounted) {
  BW.subscribe((bw) => { bodyWidth = bw; });
  BH.subscribe((bh) => { bodyHeight = bh; });
}

export let hoverValue = {};

</script>

<style>
div {
  /* opacity:.6; */
  transition: opacity 100ms;
}

.hovered {
  opacity: 1;
}

.annotation-line {
  stroke: var(--cool-gray-650);
  stroke-dasharray: 1,1;
}

.annotation-line--vol {
  stroke: var(--cool-gray-450);
  stroke-dasharray: 1,0;
  stroke-width: 3;
}

.annotation-text {
  fill: var(--cool-gray-650);
  text-transform: uppercase;
  font-size: 10px;
  font-family: var(--main-mono-font);
}

</style>

<div>
<h3 style='padding-left: {totalClientsGraph.left}px; padding-right: {totalClientsGraph.right}px' class=data-graphic__element-title>
  Total Clients by Build ID 
  <span use:tooltipAction={
    {
      text: 'hover to compare to reference ⭑; click to set reference ⭑ to hovered value ●',
      location: 'top',
}
  } class=data-graphic__element-title__icon><Help size={14} /></span></h3>

  <div class:hovered={!!hovered.datum}>
    <DataGraphic
      yType="linear"
      xType=time
      xDomain={xDomain}
      yDomain={yDomain}
      width={totalClientsGraph.width}
      height={totalClientsGraph.height}
      top={totalClientsGraph.top}
      left={totalClientsGraph.left}
      right={totalClientsGraph.right}
      bottom={totalClientsGraph.bottom}
      bottomBorder
      borderColor={totalClientsGraph.borderColor}
      bind:xScale
      bind:yScale
      bind:hoverValue
      bind:bodyWidth={BW}
      bind:bodyHeight={BH}
      bind:margins
      bind:dataGraphicMounted={dataGraphicMounted}
      on:click
    >
      <filter id="outline">
        <feMorphology operator="dilate" radius="1.5" in="SourceGraphic" result="THICKNESS" />
        <feComposite operator="out" in="THICKNESS" in2="SourceGraphic"></feComposite>
      </filter>

      <LeftAxis tickFormatter={formatCount} lineStyle=short tickCount={3} />
      <BottomAxis />
      <g slot=background let:left let:top>
        <rect 
          x={left}
          y={top}
          width={bodyWidth}
          height={bodyHeight}
          fill={totalClientsGraph.bgColor}
        />
      </g>
      <g slot=body>
      <Line 
        curve="curveStep"
        data={transformed} 
        xAccessor='label' 
        yAccessor="totalClients"
        color="var(--cool-gray-600)"
        areaColor="var(--cool-gray-200)"
        area={true} />
      </g>
      <g slot=annotation let:top let:xScale let:bottom let:width>
        {#if hovered && hovered.datum}
          <line 
            x1={xScale(hovered.datum.label)}
            x2={xScale(hovered.datum.label)}
            y1={top}
            y2={bottom}
            class=annotation-line
          />
        {/if}
        {#if reference}
        <Tweenable 
          params={tween}
          value={{
            location: xScale(reference.label),
            y: yScale(reference.audienceSize),
            audienceSize: reference.audienceSize,
  }} let:tweenValue={tv1}>
          <line 
            x1={tv1.location}
            x2={tv1.location}
            y1={top}
            y2={bottom}
            class=annotation-line
            data-audienceSize={reference.audienceSize}
          />
        </Tweenable>
        {/if}
        {#if hovered && hovered.datum}
          <text 
            filter=url(#outline)
            x={xScale(hovered.datum.label) + ((xScale(hovered.datum.label) < width / 2) ? 5 : -5)}
            text-anchor={(xScale(hovered.datum.label) < width / 2) ? 'start' : 'end'}
            y={bottom - 4}
            class=annotation-text
            style="fill:var(--cool-gray-200)"
          >
          Hov. 
          <!-- {formatCount(hovered.datum.audienceSize)} -->
          </text>
          <circle 
            cx={xScale(hovered.datum.label)} 
            cy={yScale(hovered.datum.audienceSize)} 
            r=3
            fill=var(--cool-gray-700)
          />
          <text 
            x={xScale(hovered.datum.label) + ((xScale(hovered.datum.label) < width / 2) ? 5 : -5)}
            text-anchor={(xScale(hovered.datum.label) < width / 2) ? 'start' : 'end'}
            y={bottom - 4}
            class=annotation-text
          >
          Hov. 
          <!-- {formatCount(hovered.datum.audienceSize)} -->
          </text>
        {/if}
        {#if reference && reference.label && reference.audienceSize !== undefined}
          <Tweenable 
            params={tween}
          value={{
            x: xScale(reference.label),
            y: yScale(reference.audienceSize),
            audienceSize: reference.audienceSize,
}} from={{
 x: xScale(reference.label), y: yScale(reference.audienceSize), audienceSize: reference.audienceSize,
}} let:tweenValue>
            <text
              filter=url(#outline)
              x={tweenValue.x + ((tweenValue.x < width / 2) ? 5 : -5)}
              text-anchor={(tweenValue.x < width / 2) ? 'start' : 'end'}
              y={top + 10 + 2}
              class=annotation-text
              style="fill:var(--cool-gray-100)"
              data-audienceSize={reference.audienceSize}
              data-top={top}
            >
              Ref. 
              <!-- {formatCount(tweenValue.audienceSize)} -->
            </text>
            <ReferenceSymbol
              size={20}
              xLocation={tweenValue.x} yLocation={tweenValue.y} color=var(--cool-gray-700) />
            <text 
              x={tweenValue.x + ((tweenValue.x < width / 2) ? 5 : -5)}
              text-anchor={(tweenValue.x < width / 2) ? 'start' : 'end'}
              y={top + 10 + 2}
              class=annotation-text
            >
              Ref. 
              <!-- {formatCount(tweenValue.audienceSize)} -->
            </text>
        </Tweenable>
      {/if}
      </g>
      <FirefoxReleaseVersionMarkers labels={false} />

    </DataGraphic>
  </div>
</div>

<CompareClientCounts 
  {data}
  {yDomain}
  hoverValue={hovered.datum ? hovered.datum.audienceSize : 0}
  referenceValue={reference.audienceSize}
/>
