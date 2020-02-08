<script>

import { writable } from 'svelte/store';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import Line from 'udgl/data-graphics/elements/Line.svelte';
import Point from 'udgl/data-graphics/elements/Point.svelte';
import Help from 'udgl/icons/Help.svelte';

import Marker from 'udgl/data-graphics/guides/Marker.svelte';
import MarginText from 'udgl/data-graphics/guides/MarginText.svelte';

import { window1D } from 'udgl/data-graphics/utils/window-functions';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import { formats, dmy } from '../utils/formatters';

export let width = 800;
export let height = 250;
export let left = 50;
export let right = 50;
export let top = 35;
export let bottom = 25;

export let data;
export let title;
export let description;
export let xAccessor;
export let yAccessor;
export let yFormat = 'count';
export let markers = [];
export let colors = ['blue'];
export let names = [];
export let mouseOverFontSize = 13;

const xDomain = writable([data[0][xAccessor], new Date('2020-06-22')]);
$: $xDomain = [data[0][xAccessor], new Date('2020-06-22')];

export let yMin = 0;
export let yMax = Math.max(...data.map((d) => Math.max(...yAccessor.map((y) => d[y]))).flat());
// $: yMax = Math.max(...data.map((d) => Math.max(...yAccessor.map((y) => d[y]))).flat());

const get = (d, value) => {
  const w = window1D({
    value, data: d, key: xAccessor, domain: $xDomain,
  });
  if (w.current) return w.current;
  return 0;
};

export let hoverValue = {};
export let hoverPoint = {};
$: if (hoverValue.x) {
  hoverPoint = get(data, hoverValue.x);
} else {
  hoverPoint = data[data.length - 1];
}

</script>

<style>
.chart-title {
  display: grid;
  grid-template-columns: auto max-content;
  margin-bottom: var(--space-2x);
}

span {
  color: var(--cool-gray-600);
}

span:hover {
  color: var(--cool-gray-700);
}
</style>

<div>
  <div class='chart-title' style="
      box-sizing: border-box;
      width: {width}px;
      padding-left: {left}px;
      padding-right: {right}px;
    ">
    <h4>{title} <span use:tooltipAction={description, { location: 'top' }}><Help size=15 /></span></h4>
    <div></div>
  </div>
  <DataGraphic
    width={width}
    height={height}
    top={top}
    left={left}
    right={right}
    xDomain={$xDomain} 
    yDomain={[yMin, yMax]}
    xType=time
    yType=linear
    bind:hoverValue
  >
    <g slot=background>
      <LeftAxis  tickFormatter={formats[yFormat]} />
      <BottomAxis />
    </g>

    <g slot=body>
      {#each yAccessor as y,i}
      <Line 
          lineDrawAnimation={{ duration: 800 }} 
          data={data}
          color={colors[i] || 'blue'}
          xAccessor={xAccessor}
          yAccessor={y}
        />
      {/each}
    </g>

    <!-- place additional annotations on top of the body -->
    <g>
      {#each markers as {location, label}}
        <Marker location={location}>{label}</Marker>
      {/each}
      <slot name='annotations'></slot>
    </g>

    <g slot='mouseover' let:value let:top let:right>
        {#each yAccessor as y, i}
          <Point
            color={colors[i] || 'blue'}
            x={hoverPoint[xAccessor]} y={hoverPoint[y]} r={3} />
          />
          <text x={right} y={top + mouseOverFontSize * (i + 1)} font-size={mouseOverFontSize} text-anchor='end'>
            <tspan fill=var(--cool-gray-700)>
              {formats[yFormat](hoverPoint[y])}
            </tspan>
            <tspan fill={colors[i] || 'black'} font-size=16>
              • 
            </tspan>
          </text>
          {/each}
        <MarginText yOffset={-6} fontSize=14 justify=left temporaryLabel={dmy(hoverPoint[xAccessor]) || ''} />
        <!-- <MarginText fontSize=11.5 justify=right temporaryLabel={value.y ? perc(getY(line, Math.floor(hoverValue.x)) / line[0].y - 1) : ''} /> -->
    </g>

  </DataGraphic>

</div>