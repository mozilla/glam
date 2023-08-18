<script>
  import { scaleLinear } from 'd3-scale';
  import { getContext } from 'svelte';
  import { distributionComparisonGraph } from '../../utils/constants';

  export let density;
  export let direction = 1; // or -1 for reverse.
  export let valueSelector = 'value';
  export let binSelector = 'bin';
  export let width;
  export let height;
  export let start = 0;
  export let color = 'var(--digital-blue-350)';

  const xScale = getContext('yScale');

  $: v = density.map((di) => di[valueSelector]);
  $: y = scaleLinear()
    .domain([0, Math.max(...v)])
    .range([0, height]);

  const barWidth = width/density.length

  // ok, let's just get all spacing done here.

  $: spacing = density.map((vo, i) => {
    const vi = vo[binSelector];
    let vnext;
    if (i < density.length - 1) {
      vnext = density[i + 1][binSelector];
    } else {
      vnext = density[i - 1][binSelector];
    }
    return Math.abs($xScale(vnext) - $xScale(vi));
  });

  $: offset = density.map((di, i) =>
    $xScale.type === 'scalePoint' ? $xScale.step() / 2 : spacing[i] / 2
  );
  $: pos = direction > 0;
</script>

<g style="fill: {color};">
  {#each density as { bin, value }, i}
  {console.log(bin, value, $xScale(bin))}
    <rect
      stroke={color}
      x={(i * barWidth) + (barWidth/2)}
      y={height - y(value)}
      height={y(value)}
      width={barWidth - 1} />
  {/each}
</g>
