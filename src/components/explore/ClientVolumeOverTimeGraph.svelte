<script>
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import Help from 'udgl/icons/Help.svelte';

import TrackingLine from './TrackingLine.svelte';
import TrackingLabel from './TrackingLabel.svelte';


import ReferenceSymbol from '../ReferenceSymbol.svelte';

import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';
import { formatCount } from '../../utils/formatters';

import { totalClientsGraph, tween } from '../../utils/constants';


export let data;
export let title;
export let description;
export let aggregationLevel;
export let xDomain;
export let yDomain;
export let reference;
export let hovered;

let margins;

let dataGraphicMounted;
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

<div>
<h3 style='padding-left: {totalClientsGraph.left}px; padding-right: {totalClientsGraph.right}px' class=data-graphic__element-title>
  {title}
  <span use:tooltipAction={
    {
      text: description,
      location: 'top',
}
  } class=data-graphic__element-title__icon><Help size={14} /></span></h3>

  <div>
    <DataGraphic
      yType="linear"
      xType={aggregationLevel === 'build_id' ? 'time' : 'scalePoint'}
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
      {#if aggregationLevel === 'build_id'}
        <BottomAxis  />
      {:else}
        {#if xDomain.length <= 5}
          <BottomAxis ticks={xDomain} />
        {:else}
          <BottomAxis />
        {/if}
      {/if}
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
        {data}
        xAccessor='label' 
        yAccessor="totalClients"
        color="var(--cool-gray-600)"
        areaColor="var(--cool-gray-200)"
        area={true} />
      </g>
      <g slot=annotation let:top let:xScale let:yScale let:bottom let:width>
        {#if hovered && hovered.datum}
          <TrackingLine x={hovered.datum.label} />
        {/if}
        {#if reference}
        <Tweenable 
          params={tween}
          value={{
            location: xScale(reference.label),
            y: yScale(reference.audienceSize),
            audienceSize: reference.audienceSize,
  }} let:tweenValue={tv1}>
          <TrackingLine 
            xr={tv1.location}
            data-audienceSize={reference.audienceSize}
          />
        </Tweenable>
        {/if}
        {#if hovered && hovered.datum}
          <TrackingLabel align=bottom x={hovered.datum.label} background="var(--cool-gray-200)" label="Hov." />
          <circle 
            cx={xScale(hovered.datum.label)} 
            cy={yScale(hovered.datum.audienceSize)} 
            r=3
            fill=var(--cool-gray-700)
          />

        {/if}
        {#if reference && reference.label && reference.audienceSize !== undefined}
          <Tweenable 
            params={tween}
          value={{
            x: xScale(reference.label),
            y: yScale(reference.audienceSize),
            audienceSize: reference.audienceSize,
}} from={{
  x: xScale(reference.label),
  y: yScale(reference.audienceSize),
  audienceSize: reference.audienceSize,
}} let:tweenValue>
            <ReferenceSymbol
            size={20}
            xLocation={tweenValue.x} yLocation={tweenValue.y} color=var(--cool-gray-700) />
            <TrackingLabel 
              align=top 
              label="Ref." 
              xr={tweenValue.x} 
              background=var(--cool-gray-100)
              key={reference.label}
            />


        </Tweenable>
      {/if}
      </g>
      <FirefoxReleaseVersionMarkers labels={false} />

    </DataGraphic>
  </div>
</div>

