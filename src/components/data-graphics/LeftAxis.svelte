<script>
import { getContext } from 'svelte';
import { fade } from 'svelte/transition';

const defaults = getContext('defaults');
const margins = getContext('margins');

export let width = getContext('bodyWidth');

export let yScale = getContext('yScale');
export let ticks = yScale.ticks !== undefined ? yScale.ticks() : yScale.domain();
export let fadeValues = defaults.fadeParams;
export let tickFontSize = defaults.axisTickFontSize;
export let every = 1;

</script>

<g in:fade={fadeValues} class=left-axis>
  {#each ticks as tick, i (tick)}
  {#if i % every === 0}
    <line
      x1={margins.left - margins.buffer}
      x2={margins.left + $width}
      y1={yScale(tick)}
      y2={yScale(tick)}
      stroke='var(--line-gray-01)'
      stroke-width=1
    />
    <text 
      x={margins.left - margins.buffer * 2}
      y={yScale(tick)}
      dy='.35em'
      text-anchor=end
      font-size={tickFontSize}
    >{tick}</text>
   {/if}
{/each}
</g>