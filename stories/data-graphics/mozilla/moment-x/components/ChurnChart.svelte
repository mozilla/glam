<script>
import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { stack, stackOffsetNone } from 'd3-shape';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';

import { formats } from '../utils/formatters';

export let width = 1104;
export let height = 250;
export let data;
export let xAccessor = 'date';
export let yAccessor = []; // each yAccessor is part of the stack.
export let maxY = Math.max(...data.map((d) => yAccessor.map((y) => d[y]).reduce((a, b) => a + b, 0)));
export let minY = 0;
export let colors = [];
const xDomain = writable([data[0][xAccessor], new Date('2020-06-22')]);

const inflator = tweened(0, { duration: 1000, easing });
$: inflator.set(1);

$: $xDomain = [data[0][xAccessor], new Date('2020-06-22')];

const S = stack().keys(yAccessor).offset(stackOffsetNone);
const D = S(data).map((d) => d.map((di, j) => ({ y0: di[0], y1: di[1], [xAccessor]: data[j][xAccessor] })));

</script>

<DataGraphic
  width={width}
  height={height}
  xDomain={$xDomain}
  yDomain={[minY, maxY]}
  xType=time
  yType=linear
>

  <LeftAxis tickFormatter={formats.count} />
  <BottomAxis />

  <g slot=body let:xScale let:yScale>
    {#each D as yi, i}
      {#each yi as dj, j}
        <rect 
          x={xScale(dj[xAccessor])}
          y={$inflator * yScale(dj.y1) + (1 - $inflator) * yScale(0)}
          height={((yScale(dj.y0) - yScale(dj.y1))) * $inflator}
          width={5}
          fill="var(--digital-blue-{400 - i * 100})"
        />
      {/each}
    {/each}
  </g>

</DataGraphic>