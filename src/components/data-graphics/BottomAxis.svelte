<script>
import { getContext } from 'svelte';
import { fade } from 'svelte/transition';

const defaults = getContext('defaults');
const margins = getContext('margins');

export let fadeValues = defaults.fadeParams;

export let height = getContext('bodyHeight');
export let bottomPlot = getContext('bottomPlot');
export let fontSize = defaults.axisTickFontSize;
export let xScale = getContext('xScale');
export let ticks = xScale.ticks !== undefined ? xScale.ticks() : xScale.domain();
export let tickFormatter = (t) => t;
export let every = 1;
</script>

<g in:fade={fadeValues} class=bottom-axis>
  {#each ticks as tick, i (tick)}
    {#if i % every === 0}
      <line
        x1={xScale(tick)}
        x2={xScale(tick)}
        y1={$bottomPlot}
        y2={$bottomPlot + margins.buffer}
        stroke="var(--cool-gray-200)"
        stroke-width=2
      />
      <text 
        font-size={fontSize} 
        text-anchor='middle'
        y={margins.top + $height + fontSize + margins.buffer}
        x={xScale(tick)}>{tickFormatter(tick)}</text>
      {/if}
  {/each}
</g>