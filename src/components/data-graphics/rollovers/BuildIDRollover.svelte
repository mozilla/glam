<script>
import { getContext, onMount } from 'svelte';

export let xScale = getContext('xScale');
let margins = getContext('margins');
let TOP = getContext('topPlot');
let G = getContext('graphicWidth');
let topPlot;
let graphicWidth;
TOP.subscribe((t) => { topPlot = t; });
G.subscribe((w) => { graphicWidth = w; });
export let x;
export let label;

let rollover;

// xCorrection applies when the left or right side
// of the
let leftCorrection;
let rightCorrection;
let mounted = false;
onMount(() => {
  mounted = true;
});

$: if (x && mounted) {
  let bounds = rollover.getBoundingClientRect();
  let w = bounds.width;
  leftCorrection = w / 2;
  rightCorrection = graphicWidth - w / 2;
}

</script>

<text
bind:this={rollover}
x={Math.min(Math.max(xScale(x), leftCorrection), rightCorrection)} 
y={topPlot - margins.buffer - 12}
text-anchor='middle'
font-family="var(--main-mono-font)"
font-size='12'>
<tspan fill="var(--cool-gray-500)" font-weight=bold>
  {label.slice(0, 4)}-{label.slice(4,
  6)}-{label.slice(6, 8)}{' '}</tspan> 
<tspan> {label.slice(8, 10)}:</tspan>
<tspan>{label.slice(10, 12)}:</tspan>
<tspan>{label.slice(12, 14)}</tspan>
</text>