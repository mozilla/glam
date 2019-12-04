<script>
// import { getContext } from 'svelte';
// import { fade } from 'svelte/transition';

import SimpleAxis from './SimpleAxis.svelte';

// const defaults = getContext('defaults');
// const margins = getContext('margins');

// export let width = getContext('bodyWidth');

// export let yScale = getContext('yScale');
// export let tickCount = 5;
// export let ticks = yScale.ticks !== undefined ? yScale.ticks(tickCount) : yScale.domain().reduce((acc, v, i, source) => {
//   const every = Math.floor(source.length / tickCount);
//   if (i % every === 0) {
//     acc.push(v);
//   }
//   return acc;
// }, []);
// export let fadeValues = defaults.fadeParams;
// export let tickFontSize = defaults.axisTickFontSize;
// export let every = 1;

export let props = {};
// export let tickCount = 5;
// export let fadeValues = defaults.fadeParams;

</script>

<SimpleAxis 
  {...$$props}
  side='left'
  mainScaleName='yScale'
/>

<!-- <g in:fade={fadeValues} class=left-axis>
  {#each ticks as tick, i (tick)}
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
{/each}
</g> -->