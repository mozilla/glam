<script>
  import { scaleLinear } from 'd3-scale';
  import { getContext } from 'svelte';

  export let density;
  export let direction = 1; // or -1 for reverse.
  export let valueSelector = 'value';
  export let binSelector = 'bin';
  export let width;
  export let start = 0;
  export let color = 'var(--digital-blue-350)';

  const yScale = getContext('yScale');

  $: v = density.map((di) => di[valueSelector]);
  $: y = scaleLinear()
    .domain([0, Math.max(...v)])
    .range([0, width]);

  // ok, let's just get all spacing done here.

  $: spacing = density.map((vo, i) => {
    const vi = vo[binSelector];
    let vnext;
    if (i < density.length - 1) {
      vnext = density[i + 1][binSelector];
    } else {
      vnext = density[i - 1][binSelector];
    }
    return Math.abs($yScale(vi) - $yScale(vnext));
  });

  $: offset = density.map((di, i) =>
    $yScale.type === 'scalePoint' ? $yScale.step() / 2 : spacing[i] / 2
  );
  $: pos = direction > 0;
</script>

<g style="fill: {color};">
  {#each density as { bin, value }, i}
  {console.log(bin, value, $yScale(bin))}
    <rect
      stroke={color}
      x={$yScale(density[density.length - i - 1][binSelector]) - 0.1}
      y={pos ? 0 : width - y(value)}
      height={y(value)}
      width=3 />
  {/each}
</g>
