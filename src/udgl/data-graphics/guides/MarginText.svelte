<script>
import { getContext } from 'svelte';

export let fontSize = 11;
export let fill = 'var(--cool-gray-700)';
export let temporaryLabel = '';
export let justify = 'left';
export let align = 'top';
export let yOffset = 0;
export let xOffset = 0;
let leftPlot = getContext('leftPlot');
let rightPlot = getContext('rightPlot');
// let bottomPlot = getContext('bottomPlot');
let topPlot = getContext('topPlot');

</script>

<text
  font-size={fontSize}
  fill={fill}
  y={$topPlot - fontSize + yOffset}
  x={justify === 'left' ? $leftPlot : $rightPlot + xOffset}
  text-anchor={justify === 'left' ? 'start' : 'end'}
>
  {temporaryLabel}
  <slot></slot>
</text>