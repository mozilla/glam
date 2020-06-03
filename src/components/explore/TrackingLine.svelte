<script>
import { getContext } from 'svelte';

export let x;
export let xr;

const xScale = getContext('xScale');
const top = getContext('topPlot');
const bottom = getContext('bottomPlot');
</script>

<line
  shape-rendering="crispEdges"
  x1={xr || $xScale(x)}
  x2={xr || $xScale(x)}
  y1={$top}
  y2={$bottom}
  stroke=var(--cool-gray-500)
  stroke-dasharray=1,1
/>
