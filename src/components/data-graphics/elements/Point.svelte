<script>
import { getContext } from 'svelte';

export let x;
export let y;
export let r = 2;
export let opacity = 1;
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
/>