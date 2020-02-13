<script>

  import { writable } from 'svelte/store';
  import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
  import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';
  import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
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
  export let subtitle;
  export let description;
  export let xAccessor;
  export let yAccessor;
  export let yFormat = 'count';
  export let markers = [];
  export let colors = ['blue'];
  export let names = [];
  export let mouseOverFontSize = 13;

  export let xAxisTickCount;
  export let yAxisTickCount;

  export let showXAxis = true;
  export let showYAxis = true;
  export let showXAxisLabels = true;
  export let showYAxisLabels = true;

  export let hoverPointFormat = yFormat;

  export let hovered = false; // tracks true / false if hovered

  export let size = 'standard'; // 'small';
  
  export let xMin = data[0][xAccessor];
  export let xMax = data[data.length - 1][xAccessor];
  export let xDomain = [xMin, xMax];// [data[0][xAccessor], new Date('2020-06-22')];
  $: xDomain = [xMin, xMax];
  const xDomainStore = writable(xDomain);
  $: $xDomainStore = xDomain;
  export let yMin = 0;
  export let yMax = Math.max(...data.map((d) => Math.max(...yAccessor.map((y) => d[y]))).flat());
  export let yDomain = [yMin, yMax];
  const yDomainStore = writable(yDomain);
  $: $yDomainStore = yDomain;
  // $: yMax = Math.max(...data.map((d) => Math.max(...yAccessor.map((y) => d[y]))).flat());
  
  const get = (d, value) => {
    const w = window1D({
      value, data: d, key: xAccessor, domain: $xDomainStore,
    });
    if (w.current) return w.current;
    return 0;
  };
  
  export let hoverValue = {};
  export let hoverPoint = {};
  $: if (hoverValue.x) {
    hoverPoint = get(data, hoverValue.x);
    hovered = true;
  } else {
    hoverPoint = data[data.length - 1];
    hovered = false;
  }
  
  </script>
  
  <style>


  .chart-title {
    display: grid;
    grid-template-columns: auto max-content;
    grid-template-rows: auto auto;
    grid-template-areas: 'subtitle subtitle'
                         'title title';
    margin-bottom: var(--space-2x);
  }

  .chart-title--size--small {
    margin-bottom: var(--space-1h);
  }

  .mc-title {
    grid-area: title;
    font-size: var(--text-05);
    font-weight: 500;
    color: var(--cool-gray-700);
    display: grid;
    grid-auto-flow: column;
    justify-content: start;
    justify-items: start;
    align-items: center;
    grid-column-gap: var(--space-1h);
  }

  .mc-title span {
    display: grid;
    align-items: center;
  }

  .mc-subtitle {
    grid-area: subtitle;
  }

  .mc-title--size--small {
    margin:0;
    font-size: var(--text-03);
  }
  
  span {
    color: var(--cool-gray-600);
  }
  
  span:hover {
    color: var(--cool-gray-700);
  }
  </style>
  
  <div class=mc-container>
    <div class='chart-title' 
      class:chart-title--size--small={size === 'small'}
      style="
        box-sizing: border-box;
        width: {width}px;
        padding-left: {left}px;
        padding-right: {right}px;
      ">
      {#if subtitle}
        <div class="mc-subtitle big-number--sublabel">{subtitle}</div>
      {/if}
      <h4 class=mc-title class:mc-title--size--small={size === 'small'}>{title} <span use:tooltipAction={{ text: description, location: 'top' }}><Help size=15 /></span></h4>
      <div></div>
    </div>
    <DataGraphic
      width={width}
      height={height}
      top={top}
      left={left}
      right={right}
      xDomain={$xDomainStore} 
      yDomain={$yDomainStore}
      xType=time
      yType=linear
      bind:hoverValue
    >
      <g slot=background>
        {#if showXAxis}<BottomAxis showLabels={showXAxisLabels} tickCount={xAxisTickCount} />{/if}
        {#if showYAxis}<LeftAxis showLabels={showYAxisLabels} tickCount={yAxisTickCount} tickFormatter={formats[yFormat]} />{/if}
      </g>
  
      <g slot=body let:xScale let:yScale let:left let:right>
        <slot name=mc-body xScale={xScale} yScale={yScale} left={left} right={right} hoverPoint={hoverPoint} hovered={hoverValue.body}></slot>
      </g>
  
      <!-- place additional annotations on top of the body -->
      <g>
        {#each markers as {location, label}}
          <Marker location={location}>{label}</Marker>
        {/each}
        <slot name='mc-annotation'></slot>
      </g>
  
      <g slot='mouseover' let:value let:top let:right>
          <slot name='mc-hoverpoint' hoverPoint={hoverPoint}></slot>
          {#each yAccessor as y, i}

            {#if yAccessor.length > 1}
            <!-- <text x={right} y={top + mouseOverFontSize * (i + 1)} font-size={mouseOverFontSize} text-anchor='end'>
              <tspan fill=var(--cool-gray-700)>
                {formats[hoverPointFormat](hoverPoint[y])}
              </tspan>
              <tspan fill={colors[i] || 'black'} font-size=16>
                • 
              </tspan>
            </text> -->
            {:else}
              <MarginText yOffset={-6} fontSize=14 justify=right color=var(--cool-gray-700)>
                <tspan fill={colors[i] || 'black'} font-size=16>
                  • 
                </tspan>
                <tspan>
                  {formats[hoverPointFormat](hoverPoint[yAccessor[0]])}
                </tspan>
              </MarginText>
            {/if}
            {/each}

        <MarginText yOffset={-6} fontSize=14 justify=left temporaryLabel={dmy(hoverPoint[xAccessor]) || ''} />
      </g>
  
    </DataGraphic>
  
  </div>