<script>
import { onMount } from 'svelte';
import { format } from 'd3-format';

export let value = 0;
export let height = 30;
export let labels = true;

let formatPercentage = format('.0%');

let spark;
let r = 2.5;
let margin = r * 4;

let tickHeight = 3;
let topMargin = tickHeight * 2;
let buffer = 3;
let tickLabelSize = 10;

let mounted = false;
let width = 0;

onMount(() => {
  mounted = true;
  // calculate rect max width
  width = spark.getBoundingClientRect().width - margin * 3;
});

</script>

<style>
svg {
    --data-color: var(--digital-blue-light-10);
}

.bar {
    stroke: var(--data-color);
}
.dot {
    fill: var(--data-color);
}
text {
    fill: var(--subhead-gray);
}

.tick {
    stroke: var(--subhead-gray);
} 

.guide {
    stroke-dasharray: 1,1;
}

</style>

<div>
    <svg bind:this={spark} class=spark-bar width="100%" height={height}>
        {#each [0, 0.25, 0.5, 0.75, 1] as tick, i}
            <line class=tick
                stroke-width={i === 0 ? 1.5 : 1} 
                x1={margin + tick * width} 
                x2={margin + tick * width}
                y1={i === 0 ? topMargin - tickHeight * 2 : topMargin - tickHeight}
                y2={i === 0 ? topMargin + tickHeight * 2 : topMargin + tickHeight} />
            {#if labels && i % 2 === 0}
            <text 
                font-size={tickLabelSize} 
                text-anchor="middle"
                x={margin + width * tick} 
                y={topMargin + tickHeight + buffer + tickLabelSize}>
                {formatPercentage(tick)}
            </text>
            {/if}
        {/each}
        <line class="tick guide" x1={margin} x2={margin + width} y1={topMargin} y2={topMargin}
         />
        <line class=bar x1={margin} x2={margin + width * value} y1={topMargin} y2={topMargin}
            stroke-width="2"
         />
        <circle class=dot cx={margin + width * value} cy={topMargin} r={r} />
    </svg>
</div>
