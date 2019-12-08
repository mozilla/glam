<script>
import { cubicOut as easing } from 'svelte/easing';

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import MarginText from '../../../src/components/data-graphics/guides/MarginText.svelte';


import Springable from '../../../src/components/data-graphics/motion/Springable.svelte';
import Tweenable from '../../../src/components/data-graphics/motion/Tweenable.svelte';

function createData(n = 30) {
  let y = 50;
  return Array.from({ length: n }).map((_, i) => {
    let r = (Math.random() - 0.5) * 20;
    y = Math.max(0, Math.min(100, y + r));

    let year = Math.floor(i / 12);
    let month = 3;// (i % 12) + 1;
    let day = i + 1;

    return { y, x: new Date(`${1990}-${month}-${day}`) };
  });
}

// taken from d3 source https://github.com/d3/d3-array/blob/master/src/ascending.js
/* eslint-disable */

function c(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function b(a, x, lo = 0, hi = a.length) {
  while (lo < hi) {
    let mid = lo + hi >>> 1;
    if (c(+a[mid].x, x) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/* eslint-enable */

let data = createData();

function g(d, v) {
  if (v < d[0].x) return d[0];
  const index = b(d, v);
  if (index >= d.length) return d[d.length - 1];
  const prior = index - 1;
  let midpoint = 0;
  let px;
  let ix;
  if (d[prior]) {
    px = +d[prior].x;
    ix = +d[index].x;
    midpoint = (ix - px) / 2;
  }
  if (v < (d[index].x - midpoint)) return d[prior];
  return d[index];
}

</script>

<div class=story>
  <DataGraphic
    xDomain={[data[0].x, data[data.length - 1].x]}
    yDomain={[0, 100]}
    xType='time'
    yType='linear'
    width={500}
    height={250}
  >
    <LeftAxis />
    
    <BottomAxis />

    <Line
      data={data}
      lineDrawAnimation={{ duration: 1000 }}
     />

    <g slot='mouseover' let:value={value}>
      {#if value.x}
        <Tweenable params={{ duration: 200, easing }} value={g(data, value.x).y} let:tweenValue>
            <!-- a bug in svelte prevents us from using MarginText w/ slot props if in another slot prop context.
            For now, we'll use temporaryLabel, but obviously this isn't ideal. -->
            <MarginText fontSize=13 justify=right temporaryLabel={Math.round(tweenValue)} />
        </Tweenable>
        
        <Springable
            value={{ x: g(data, value.x).x, y: g(data, value.x).y }} 
            let:springValue={spr} >
              <Point x={spr.x} y={spr.y} r={2.5} />
        </Springable>
      {/if}
    </g>
  </DataGraphic>
</div>