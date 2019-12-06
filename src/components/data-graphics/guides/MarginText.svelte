<script>
import { getContext } from 'svelte';

export let fontSize = 11;
export let fill = 'var(--cool-gray-500)';
export let temporaryLabel = '';
export let justify = 'left';
export let align = 'top';
let leftPlot = getContext('leftPlot');
let rightPlot = getContext('rightPlot');
// let bottomPlot = getContext('bottomPlot');
let topPlot = getContext('topPlot');

</script>

<text
  font-size={fontSize}
  fill={fill}
  y={$topPlot - fontSize}
  x={justify === 'left' ? $leftPlot : $rightPlot}
  text-anchor={justify === 'left' ? 'start' : 'end'}
>
  {temporaryLabel}
</text>