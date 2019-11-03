<script>
import { getContext } from 'svelte';
import { draw, fade } from 'svelte/transition';
import * as SHAPE from 'd3-shape';


export let xScale = getContext('xScale');
export let yScale = getContext('yScale');
export let xAccessor = 'x';
export let yAccessor = 'y';
export let data;
export let color = 'var(--digital-blue-500)';
export let strokeWidth = 1;
export let lineDrawAnimation = { duration: 0 };
export let curve = 'curveMonotoneX';

const curveFunction = SHAPE[curve];

const lineGenerator = SHAPE.line()
  .x((d) => xScale(d[xAccessor]))
  .y((d) => yScale(d[yAccessor]))
  .curve(curveFunction);

</script>

<g class=line>
  <path 
    stroke={color} 
    stroke-width={strokeWidth}
    fill=none 
    in:draw={lineDrawAnimation}
    d={lineGenerator(data)} />
</g>