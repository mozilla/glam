<script>
import { onMount, createEventDispatcher } from 'svelte';
import { format } from 'd3-format';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';

import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';
import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';

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

.median {
  font-weight: bold;
  font-size: var(--text-03);
}
</style>

<tr class:reference={isReference} on:click={() => { onClick(datum); }}>
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
        width=150
        height=45
        left=0
        right=0
        top=0
        bottom=0
        xDomain={datum.histogram.map((d) => d.bin)}
        yDomain={['top', 'bottom']}
      >
        <Violin 
          orientation='horizontal'
          rawPlacement={45 / 2.0}
          density={datum.histogram}
          densityAccessor='value'
          valueAccessor='bin'
          densityRange={[0, 45 / 3.0]}
          areaColor="var(--digital-blue-400)"
          lineColor="var(--digital-blue-500)"
        />
        <!-- <Violin
        orientation="vertical"
        showRight={false}
        rawPlacement={(rightPlot - leftPlot) / 2 + leftPlot + 1}
        opacity=.9
        key={rightLabel}
        density={rightDistribution} 
        densityAccessor='value'
        valueAccessor='bin'
        densityRange={[0, 30]}
        areaColor="var(--digital-blue-400)"
        lineColor="var(--digital-blue-500)"
      /> -->
      </DataGraphic>
    </td>
  </tr>