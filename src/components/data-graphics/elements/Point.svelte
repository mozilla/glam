<script>
import { getContext } from 'svelte';

export let x;
export let y;
export let r = 2;
export let opacity = 1;
export let fillOpacity = 1;
export let stroke = 'none';
export let strokeWidth = 0;
export let strokeOpacity = 1;
export let fill = 'blue';

const xScale = getContext('xScale');
const yScale = getContext('yScale');
</script>

<circle 
  cx={xScale(x)}
  cy={yScale(y)}
  r={r}
  fill={fill}
  opacity={opacity}
  fill-opacity={fillOpacity}
  stroke={stroke}
  stroke-width={strokeWidth}
  stroke-opacity={strokeOpacity}
/>