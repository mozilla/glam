<script>
import { scaleLinear } from 'd3-scale';
import { getContext } from 'svelte';

export let density;
export let direction = 1; // or -1 for reverse.
export let valueSelector = 'value';
export let width;
export let start = 0;
export let color = 'var(--digital-blue-350)';

const yScale = getContext('yScale');

$: v = density.map((di) => di[valueSelector]);
$: x = scaleLinear()
  .domain([0, Math.max(...v)])
  .range([0, width]);
$: offset = $yScale.type === 'scalePoint' ? $yScale.step() / 2 : 0;
$: height = $yScale.type === 'scalePoint' ? $yScale.step() : 5;
$: pos = direction > 0;
</script>

<g style="transform: translateX({start}px); mask: url(#myMask); fill: {color};">
  {#each density as {bin, value}, i (`${bin}-${value}`)}
    <rect x={pos ? 0 : width - x(value)} y={$yScale(bin) - offset - 0.1} width={x(value)} height={height + 0.2} />
  {/each}
</g>
