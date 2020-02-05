<script>
import { getContext, onMount } from 'svelte';
import { formatToBuildID } from '../../utils/formatters';

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

let parsedLabel = '';
$: parsedLabel = formatToBuildID(label);

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
x={Math.min(Math.max($xScale(x), leftCorrection), rightCorrection)} 
y={topPlot - margins.buffer - 12}
text-anchor='middle'
font-family="var(--main-mono-font)"
font-size='12'>
<tspan fill="var(--cool-gray-500)" font-weight=bold>
  {parsedLabel.slice(0, 4)}-{parsedLabel.slice(4,
  6)}-{parsedLabel.slice(6, 8)}{' '}</tspan> 
<tspan> {parsedLabel.slice(8, 10)}:</tspan>
<tspan>{parsedLabel.slice(10, 12)}:</tspan>
<tspan>{parsedLabel.slice(12, 14)}</tspan>
</text>