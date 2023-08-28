<script>
  import { scaleLinear } from 'd3-scale';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';

  export let density;
  export let valueSelector = 'value';
  export let binSelector = 'bin';
  export let width;
  export let height;
  export let offsetX;
  export let offsetY;
  export let color = 'var(--digital-blue-350)';

  $: v = density.map((di) => di[valueSelector]);
  $: y = scaleLinear()
    .domain([0, Math.max(...v)])
    .range([0, height]);

  const bucketWidth = width*1.0101/density.length
  const spaceBetweenBars = bucketWidth/10
  const barOffsetX = spaceBetweenBars/2
  const barWidth = bucketWidth - spaceBetweenBars
</script>
<style>
  .hovd {
    opacity: 0;
  }
  .hovd:hover {
    opacity: 0.3;
    z-index: 999;
  }
</style>
<g style="fill: {color};">
  {#each density as { bin, value }, i}
    <rect
      stroke={color}
      x={offsetX + (i * bucketWidth) + barOffsetX}
      y={height - y(value) + offsetY}
      height={y(value)}
      width={barWidth}/>
  {/each}
</g>

<g style="fill: {"#fafafa"};">
  {#each density as { bin, value }, i}
    {@const bucketTxt = i == density.length - 1 ? "sample value ≥ " + bin : bin + " ≤ sample value ≥ " + density[i + 1][binSelector] + " | "}
    {@const valTxt = Intl.NumberFormat('en-US', {style: 'percent', maximumFractionDigits: 2}).format(value) + " of samples"}
    <rect
      x={offsetX + (i * bucketWidth) + barOffsetX}
      y={offsetY}
      height={height}
      width={barWidth}
      class="hovd"
      use:tooltipAction={{
        text: bucketTxt + valTxt,
        location: 'top',
        alignment: 'center',
      }}/>
  {/each}
</g>
