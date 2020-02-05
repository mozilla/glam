<script>
  import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { fade } from 'svelte/transition';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from '../../../components/data-graphics/DataGraphic.svelte';
import Violin from '../../../components/data-graphics/elements/Violin.svelte';
import Axis from '../../../components/data-graphics/guides/Axis.svelte';

import { formatCount } from '../../../utils/formatters';

export let probe;
export let info;
export let metricType;
export let metricKind;

export let xScaleType = 'scalePoint';

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

let totalClients = tweened(0, { duration: 1000, easing });

$: $totalClients = dist.total_users;
let hist = dist.histogram;

let xDomain = Object.keys(hist);
let spr = tweened(1, { duration: 2000, delay: 1000, easing });
let distSpring = [];
$: distSpring = Object.entries(hist).map(([k, v]) => ({ bin: k, value: v * $spr }));

// $: $spr = 1;

onMount(() => {
    width = container.getBoundingClientRect().width;
});

</script>

<div bind:this={container} style="min-height:{height}px">
  {#if width}
  <DataGraphic
    {xDomain}
    yDomain={['Y']}
    xType={xScaleType}
    width={width}
    height={height}
    top={20}
    bottom={28}
    left={16}
    right={16}
  >
    <g slot=body let:bottom let:top let:yScale let:hoverValue let:xScale>
      <Violin
        data={dist}
        rawPlacement={bottom}
        showLeft={false}
        orientation=horizontal
        density={distSpring}
        valueAccessor=bin
        densityAccessor=value
        areaColor={'var(--digital-blue-400)'}
        lineColor={'var(--digital-blue-500)'}
        opacity={0.8}
        densityRange={[0, (yScale.step() * 0.8)]}
      />
      {#if hoverValue.x}
      <rect
        in:fade={{ duration: 100 }}
        x={xScale(hoverValue.x) - xScale.step() / 2}
        y={top}
        width={xScale.step()}
        height={bottom - top}
        fill=var(--cool-gray-600)
        opacity=.3
      />
      {/if}
    </g>
    <g slot=annotation let:hoverValue let:xScale let:top let:bottom let:left let:right>
      <Axis side=bottom showBorder tickFormatter={formatCount} />
      <g style='font-size:11px;' >
        {#if hoverValue.x}
          <text in:fade={{ duration: 100 }} fill=var(--cool-gray-600) x={left} text-anchor=start  y={top - 4}>{formatCount(hoverValue.x)}</text>
          <text in:fade={{ duration: 100 }} fill=var(--cool-gray-600) x={right} text-anchor=end  y={top - 4}>{formatCount(hist[hoverValue.x])} clients</text>
        {/if}
        <!-- <text  fill=var(--cool-gray-600) text-anchor=end x={right}  y={top - 4}>{formatCount($totalClients)} clients </text> -->
      </g>
    </g>
  </DataGraphic>
  {/if}
</div>