<script>
  import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { fade } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import Axis from 'udgl/data-graphics/guides/Axis.svelte';

import { createCatColorMap } from 'udgl/data-graphics/utils/color-maps';


import { formatPercent } from '../../utils/formatters';

export let probe;
export let info;
export let metricType;
export let metricKind;

export let xScaleType = 'scalePoint';
export let buffer = 8;
let container;
let width;
let height = 100;
let dist;
if (metricType === 'histogram' && 'summed-histogram' in probe) {
    dist = probe.data.find((d) => d.client_agg_type === 'summed-histogram');
  } else if (metricType === 'scalar' && 'avg' in probe) {
    dist = probe.data.find((d) => d.client_agg_type === 'avg');
  } else {
    dist = probe.data[0];
}

function sortEntriesByValue(a, b) {
  // sorts
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    return 0;
}

function kLargestBins(binObject, k = 10) {
    const bins = Object.entries(binObject);
    bins.sort(sortEntriesByValue);
    return bins.slice(0, k).map(([k]) => k);
}


let totalClients = tweened(0, { duration: 1000, easing });

$: $totalClients = dist.total_users;
let hist = dist.histogram;
let xDomain = Object.keys(hist);
let yDomain = [0, Math.max(...Object.values(hist)) * 1.3];

let tickFormatter;
if (info.kind === 'boolean') {
    tickFormatter = (t) => ['No', 'Yes'][Number(t)];
} else {
    tickFormatter = (t) => t;
}

const colorMap = createCatColorMap(kLargestBins(hist));
let tickCount = Math.min(xDomain.length, 6);

function perc(k) {
    const t = Object.values(hist).reduce((a, b) => a + b, 0);
    return hist[k] / t;
}

// $: $spr = 1;

onMount(() => {
    width = container.getBoundingClientRect().width;
});
// FIXME: as of svelte 3.18.1, for some reason I have to bind this
// particular hoverValue instance, but not the same sort of one over in Quantile.svelte.
// This is clearly a bug in Svelte. There's no reason why this should not work as I've implemented.
// let hoverValue = {};
</script>

<div bind:this={container} style="min-height:{height}px">
  {#if width}
  <DataGraphic
    {xDomain}
    {yDomain}
    yType=linear
    xType=scaleBand
    xInnerPadding={0.2}
    xOuterPadding={0}
    width={width}
    height={height}
    top={20}
    bottom={28}
    left={16}
    right={16}
  >
    <g slot=body let:xScale let:yScale let:top let:hoverValue let:bottom>
      {#each Object.keys(hist) as key, i (key)}
        <rect 
          x={xScale(key)}
          y={yScale(hist[key])}
          width={xScale.bandwidth()}
          height={yScale(0) - yScale(hist[key])}
          fill={colorMap(key) || 'var(--cool-gray-200)'}
          stroke={colorMap(key) || 'var(--cool-gray-200)'}
          fill-opacity=.8
        />
      {/each}
      {#if hoverValue.x}
        <rect
          in:fade={{ duration: 100 }}
          x={xScale(hoverValue.x)}
          y={top}
          width={xScale.bandwidth()}
          height={bottom - top}
          fill=var(--cool-gray-600)
          opacity=.3
        />
      {/if}
    </g>
    <g slot=annotation let:hoverValue let:xScale let:top let:bottom let:left let:right>
      {#if metricKind !== 'categorical'}
        <Axis side=bottom showBorder tickCount={tickCount} tickFormatter={tickFormatter} />
      {:else}
        <Axis side=bottom showBorder showLabels={false} showTicks={false} tickFormatter={tickFormatter} />
      {/if}
      <g style='font-size:11px;' >
        {#if hoverValue.x}
          <text in:fade={{ duration: 100 }} fill=var(--cool-gray-600) x={left} text-anchor=start  y={top - 4}>
            {tickFormatter(hoverValue.x)}
          </text>
          <text in:fade={{ duration: 100 }} fill=var(--cool-gray-600) x={right} text-anchor=end  y={top - 4}>
            {formatPercent(perc(hoverValue.x))}
          </text>
        {/if}
      </g>
    </g>
  </DataGraphic>
  {/if}
</div>
