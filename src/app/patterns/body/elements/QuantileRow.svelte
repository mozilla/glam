<script>
import { onMount, createEventDispatcher } from 'svelte';
import { format } from 'd3-format';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';

const percFormat = (v) => `${~~(v * 100)}%`;
const countFormat = format(',.0f');
const numberFormat = format('.0f');

const audienceSize = tweened(0, { duration: 800, easing });

const dispatch = createEventDispatcher();
function onClick(v) {
  dispatch('click', {
    value: v,
  });
}

export let datum;
export let isReference;

$: if (datum.audienceSize) audienceSize.set(datum.audienceSize);

let hovered = false;

let xScale;

</script>

<style>

td, th {
  font-size: var(--text-02);
  text-align: right;
  padding: var(--space-base);
  padding-left: var(--space-2x);
  padding-right: var(--space-2x);
}



tr td:first-child {
  text-align: left;
}

tr:hover td {
  background-color: var(--cool-gray-100);
}

tr td:hover {
  background-color: var(--cool-gray-200);
}


td.data-cell--main {
  min-width: var(--space-16x);
}

td.data-cell--secondary {
  border-right: 2px solid var(--cool-gray-200);
  min-width: var(--space-16x);
}

.reference {
  background-color: var(--pantone-red-100);
}

.overline--small {
  font-size: var(--text-01);
  text-transform: uppercase;
  font-weight: bold;
  color: var(--cool-gray-500);
}

.build-id {
  font-family: var(--main-mono-font);
}

.data-cell--graphic {
  padding:0;
  vertical-align: center;
}

tr td.data-cell--graphic:hover {
  padding:0;
  vertical-align: center;
  background-color: var(--cool-gray-100);
}

.median {
  font-weight: bold;
  font-size: var(--text-03);
}
</style>

<tr class:reference={isReference} on:mouseout={() => { hovered = false; }} on:mouseover={() => { hovered = true; }} on:click={() => { onClick(datum); }}>
    <td class=data-cell--main>
      <div>
        <div class=overline--small>Firefox {datum.version}</div>
        <div class=build-id>
          <span>{datum.label.slice(0, 4)}</span>-<span>{datum.label.slice(4, 6)}</span>-<span>{datum.label.slice(6, 8)}</span>
          {datum.label.slice(8, 10)}:{datum.label.slice(10, 12)}:{datum.label.slice(12, 14)}
        </div>
      </div>
    </td>
    <td class=data-cell--secondary>{countFormat($audienceSize)}</td>
    
    {#each Object.keys(datum.percentiles) as p, i (p + datum.percentiles[p])}
      <td class=data-cell--metric>
        <div class:median={p === '50'}>
          {numberFormat(datum.percentiles[p])}
        </div>
      </td>
    {/each}
    <td class=data-cell--graphic>
      <DataGraphic
        width={250}
        height={50}
        left={10}
        right={10}
        top={0}
        bottom={0}
        bind:xScale={xScale}
        xDomain={datum.histogram.map((d) => d.bin)}
        yDomain={['top', 'bottom']}
      >
        <TopAxis tickCount=6 lineStyle='long' />

        <Violin 
          orientation='horizontal'
          rawPlacement={50 / 2.0}
          density={datum.histogram}
          densityAccessor='value'
          valueAccessor='bin'
          opacity={hovered || isReference ? 0.9 : 0.6}
          densityRange={[0, 50 / 4.0]}
          areaColor="var(--digital-blue-400)"
          lineColor="var(--digital-blue-500)"
        />
        <!-- {#if xScale}
          <line 
            x1={xScale(datum.transformedPercentiles[5])}
            x2={xScale(datum.transformedPercentiles[95])}
            y1={50 - 6}
            y2={50 - 6}
            stroke=var(--cool-gray-300)
          />
          {#each Object.keys(datum.percentiles) as p, i}
            {#if ['5', '95'].includes(p)}
              <circle 
                cx={xScale(datum.transformedPercentiles[p])} 
                cy={50 - 6} r=2 fill={percentileLineColorMap(+p)} />
            {:else}
            <line 
              x1={xScale(datum.transformedPercentiles[p])} 
              x2={xScale(datum.transformedPercentiles[p])}
              y1={50 - 9}
              y2={50 - 3}
              stroke={percentileLineColorMap(+p)}
              stroke-width=2 />
            {/if}
          {/each}
      {/if} -->
      </DataGraphic>
    </td>
  </tr>