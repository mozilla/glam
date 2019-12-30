<script>
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

import { fly } from 'svelte/transition';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import Springable from '../../../src/components/data-graphics/motion/Springable.svelte';

import { window1D } from '../../../src/components/data-graphics/utils/window-functions';

let dtfmt = timeFormat('%b %d, %Y');

let dates = (n = 365) => {
  let dt = new Date('2017-06-01');
  return Array.from({ length: n }).fill(null).map((_, i) => {
    let dt2 = new Date(dt);
    dt.setDate(dt.getDate() + 1);
    return dt2;
  });
};

let M = (Math.random() * 10);
let dau = 1000000 * M;
let wau = dau * 2;
let mau = dau * 3.5;
let usage = 2.5;
let r01 = 0.8;
let r02 = 0.7;

const metricData = dates().map((date) => {
  dau += (Math.random() - 0.45) * 100000 * M;
  wau += (Math.random() - 0.45) * 50000 * M;
  mau += (Math.random() - 0.45) * 50000 * M;
  const r = Math.random();
  if (r < 0.005) {
    r01 += (Math.random() - 0.6) * 0.1;
  }
  return {
    date,
    dau,
    wau,
    mau,
    usage: usage + (Math.random() - 0.5) * 0.1,
    retention01: r01 + (Math.random() - 0.5) * 0.05,
    retention02: r02 + (Math.random() - 0.5) * 0.05,
  };
});


let xDomain = [
  new Date(Math.min(...metricData.map((d) => d.date))),
  new Date(Math.max(...metricData.map((d) => d.date)))];
let auMax = Math.max(
  ...metricData.map((d) => d.dau),
  ...metricData.map((d) => d.wau),
  ...metricData.map((d) => d.mau),
) * 1.1;


const get = (d, value) => {
  const w = window1D({
    value, data: d, key: 'date', domain: xDomain,
  });
  if (w.current) return w.current;
  return 0;
};


const graphs = [
  {
    name: 'DAU', key: 'dau', type: 'count', yMax: auMax, yFormat: (v) => format('~s')(v),
  },
  {
    name: 'WAU', key: 'wau', type: 'count', yMax: auMax, yFormat: (v) => format('~s')(v),
  },
  {
    name: 'MAU', key: 'mau', type: 'count', yMax: auMax, yFormat: (v) => format('~s')(v),
  },
  {
    name: 'Usage', key: 'usage', type: 'rate', yMax: 7, yFormat: format(',d'),
  },
  {
    name: 'Retention ', key: 'retention01', type: 'percentage', yMax: 1, yFormat: format('.0%'),
  },
  {
    name: 'Retention (1 wk. new)', key: 'retention02', type: 'percentage', yMax: 1, yFormat: format('.0%'),
  },
];

let hoverValue = {};
let hoverPt;
$: hoverPt = get(metricData, hoverValue.x ? hoverValue.x : metricData[metricData.length - 1].date);

</script>

<style>
.multiples {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-column-gap: var(--space-4x);
  grid-row-gap: var(--space-8x);
  justify-content: start;
}

.dg-header {
  display: grid;
  grid-template-columns: auto auto;
  padding-left: 36px;
  padding-right: 12px;
}

h2 {
  margin: 0;
  font-size: 16px;
}

.dg-header div {
  justify-self: end;
  
}

</style>

<div class=story>
  <h1 class=story__title>Usage Metrics</h1>
  <div class=multiples>
    {#each graphs as {name, type, key, yMax, yFormat}, i}
      <div>
        <div class=dg-header>
            <h2>{name}</h2>
            <div>
              {yFormat(get(metricData, hoverValue.x ? hoverValue.x : metricData[metricData.length - 1].date, key)[key])}
          </div>
        </div>
        
        <DataGraphic
          width={300}
          height={200}
          top={20}
          left={36}
          right={12}
          xDomain={xDomain}
          yDomain={[0, yMax]}
          xType=time
          yType=linear
          bind:hoverValue={hoverValue}
        >

          <LeftAxis  tickFormatter={yFormat} />
          <BottomAxis />

          <Line lineDrawAnimation={{ duration: 1200 }} data={metricData} xAccessor=date yAccessor={key} />

          <Springable
            params={{ stiffness: 0.4, damping: 0.9 }}
            value={hoverPt} 
            let:springValue={spr} >
              <g in:fly={{ duration: 1000, y: 200 }}>
                <Point x={spr.date} y={spr[key]} r={3} />
              </g>
              {#if hoverValue.x}
                <text x={36} y={12} font-size={12}>{dtfmt(spr.date)}</text>
              {/if}
          </Springable>
        </DataGraphic>
      </div>
    {/each}
  </div>
</div>