<script>
  import { getContext, onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut as easing } from 'svelte/easing';
  import { formatToBuildID } from '../../utils/formatters';

  export let xScale = getContext('xScale');
  let top = getContext('topPlot');
  let left = getContext('leftPlot');
  let right = getContext('rightPlot');

  export let x;
  export let label;

  let xt = tweened($xScale(x) || 0, { duration: 50, easing });
  $: $xt = $xScale(x) || 0;

  let parsedLabel = '';
  $: parsedLabel = formatToBuildID(label);

  let rollover;
  let leftCorrection;
  let rightCorrection;
  let mounted = false;
  onMount(() => {
    mounted = true;
  });

  $: if (x && mounted) {
    let bounds = rollover.getBoundingClientRect();
    let w = bounds.width;
    leftCorrection = $left + w / 2;
    rightCorrection = $right - w / 2;
  }
</script>

<style>
  tspan {
    fill: var(--cool-gray-650);
  }
</style>

<text
  bind:this={rollover}
  x={Math.min(Math.max($xt, leftCorrection), rightCorrection)}
  y={$top - 16}
  text-anchor="middle"
  font-family="var(--main-mono-font)"
  font-size="12">
  <tspan fill="var(--cool-gray-700)" font-weight="bold">
    {parsedLabel.slice(0, 4)}-{parsedLabel.slice(4, 6)}-{parsedLabel.slice(
      6,
      8
    )}{' '}
  </tspan>
  <tspan>{parsedLabel.slice(8, 10)}:</tspan>
  <tspan>{parsedLabel.slice(10, 12)}:</tspan>
  <tspan>{parsedLabel.slice(12, 14)}</tspan>
</text>
