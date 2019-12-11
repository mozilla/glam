<script>
import { cubicOut as easing } from 'svelte/easing';

import { schemeTableau10 as cm } from 'd3-scale-chromatic';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import MarginText from '../../../src/components/data-graphics/guides/MarginText.svelte';
import Marker from '../../../src/components/data-graphics/guides/Marker.svelte';

import Springable from '../../../src/components/data-graphics/motion/Springable.svelte';
import Tweenable from '../../../src/components/data-graphics/motion/Tweenable.svelte';

function createData(n = 155) {
  let y = 20 + Math.random() * 0.6 * 100;
  let d = new Date('1990-03-01');
  return Array.from({ length: n }).map(() => {
    let x = new Date(+d);
    d.setDate(d.getDate() + 1);
    // d.setHours(d.getHours() + 1);
    let r = (Math.random() - 0.5) * 10;
    y = Math.max(0, Math.min(100, y + r));

    return { y, x };
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

const N = 5;

let data = Array.from({ length: N }).fill(null).map(() => createData());

function g(d, v) {
  if (v < d[0].x) return { ...d[0], index: 0 };
  const index = b(d, v);
  if (index >= d.length) return { ...d[d.length - 1], index: d.length - 1 };
  const prior = index - 1;
  let midpoint = 0;
  let px;
  let ix;
  if (d[prior]) {
    px = +d[prior].x;
    ix = +d[index].x;
    midpoint = (ix - px) / 2;
  }
  if (v < (d[index].x - midpoint)) return { ...d[prior], index: prior };
  return { ...d[index], index };
}

function gg(d, v) {
  return d.map((di) => g(di, v));
}

function getValue(d, v) {
  return d.map((di) => g(di, v.x).y);
}

function getXY(d, v) {
  return d.map((di) => ({ x: g(di, v.x).x, y: g(di, v.x).y }));
}

</script>

<style>
.data-graphic-container {
  font-family: var(--main-mono-font);
}
</style>

<div class=story>
  <h1 class=story__title>Multiple lines, custom hover</h1>
  <div class=data-graphic-container>
  <DataGraphic
    xDomain={[data[0][0].x, data[0][data[0].length - 1].x]}
    yDomain={[0, 100]}
    xType='time'
    yType='linear'
    width={700}
    height={350}
    right={120}
  >
    <LeftAxis />
    
    <BottomAxis />

    {#each data as line, i}
    <Line
      data={line}
      color={cm[i]}
      lineDrawAnimation={{ duration: 1000 }}
     />
    {/each}

    <g slot='mouseover' let:value={value} let:top let:right let:bottom let:width let:xScale let:yScale>

      {#if value.x}
        {#each getValue(data, value) as v, i}
        <Tweenable params={{ duration: 100 }} value={v} let:tweenValue>
          <text 
            x={right} 
            text-anchor=end
            y={top + 12 * (i + 1)}
            font-size=12
          >
            <tspan>
                {Math.round(tweenValue)}
            </tspan> <tspan font-size=20 dx=2 dy=2 fill={cm[i]}>•</tspan> 
          </text>
          <text 
            x={right + 2 } 
            text-anchor=start
            y={top + 12 * (i + 1)}
            font-size=11
            fill={cm[i]}
            >
            {['WI', 'FL', 'TX', 'CA', 'NY'][i]}
          </text>
      </Tweenable>

        {/each}
      {/if}

      {#if value.x}
      <Springable value={g(data[0], value.x)} let:springValue>
          <Marker 
            location={springValue.x} 
            lineColor=var(--cool-gray-300)
            lineThickness=2
            dasharray='3,2'
          />
          <text          
            text-anchor=middle
            font-size=12
            fill=var(--cool-gray-400)
            font-weight=bold
            text-transform=uppercase
            x={xScale(springValue.x)} 
            y={top - 8}>day {Math.round(springValue.index)}</text>
      </Springable>

      <Springable
          value={getXY(data, value)} 
          let:springValue={spr} >
            {#each spr as {x,y}, i}
              <Point fill={cm[i]} x={x} y={y} r={3} />
            {/each}
      </Springable>


    {/if}
    </g>
  </DataGraphic>
  </div>
</div>