<script>
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

import { fly, fade } from 'svelte/transition';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import LineBand from '../../../src/components/data-graphics/elements/LineBand.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';
import VerticalErrorBar from '../../../src/components/data-graphics/elements/VerticalErrorBar.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import Springable from '../../../src/components/data-graphics/motion/Springable.svelte';

import { window1D } from '../../../src/components/data-graphics/utils/window-functions';

import FirefoxReleaseVersionMarkers from '../../../src/app/patterns/elements/FirefoxReleaseVersionMarkers.svelte';

let dtfmt = timeFormat('%b %d, %Y');

let dates = (n = 365) => {
  let dt = new Date('2019-01-01');
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

const metricData = dates().map((date, i) => {
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
    dauLow: dau * 0.95 * (1 - Math.random() / 8),
    dauHigh: dau * 1.1,
    wau,
    wauLow: wau * 0.95,
    wauHigh: wau * 1.05,
    mau,
    mauLow: mau * 0.9,
    mauHigh: mau * 1.1,
    usage: usage + (Math.random() - 0.5) * 0.1,
    retention01: r01 + (Math.random() - 0.5) * 0.05,
    retention02: r02 + (Math.random() - 0.5) * 0.05,
  };
});


let xDomain = [
  new Date(Math.min(...metricData.map((d) => d.date))),
  new Date(Math.max(...metricData.map((d) => d.date)))];
let auMax = Math.max(
  ...metricData.map((d) => d.dauHigh),
  ...metricData.map((d) => d.wauHigh),
  ...metricData.map((d) => d.mauHigh),
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
    name: 'DAU', key: 'dau', type: 'count', yMax: auMax, axisFormat: format('~s'), hoverFormat: format('~s'),
  },
  {
    name: 'WAU', key: 'wau', type: 'count', yMax: auMax, axisFormat: format('~s'), hoverFormat: format('~s'),
  },
  {
    name: 'MAU', key: 'mau', type: 'count', yMax: auMax, axisFormat: format('~s'), hoverFormat: format('~s'),
  },
  {
    name: 'Usage', key: 'usage', type: 'rate', yMax: 7, axisFormat: format(',d'), hoverFormat: format('.2f'),
  },
  {
    name: 'Retention ', key: 'retention01', type: 'percentage', yMax: 1, axisFormat: format('.0%'), hoverFormat: format('.2%'),
  },
  {
    name: 'Retention (1 wk. new)', key: 'retention02', type: 'percentage', yMax: 1, axisFormat: format('.0%'), hoverFormat: format('.2%'),
  },
];

let hoverValue = {};
let mouseDownValue = {};
let mouseMoveValue = {};
let startValue;
let endValue;
let hoverPt;

$: hoverPt = get(metricData, hoverValue.x ? hoverValue.x : metricData[metricData.length - 1].date);

const resetMouseClicks = () => {
  mouseDownValue = {};
  mouseMoveValue = {};
};

const endMouseEvent = () => {
  startValue = mouseDownValue.x;
  endValue = mouseMoveValue.x;
  resetMouseClicks();
};

const dateDiff = (a, b) => Math.ceil(Math.abs(a - b) / (1000 * 60 * 60 * 24));

// generate random data for the key.

const legendData = Array.from({ length: 20 }).map((_, i) => {
  let y = 0.5 + (Math.random() - 0.5) * 0.05;
  return {
    x: i / 20, y, yMin: y * 0.7, yMax: y * 1.3,
  };
});

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
  <h1 class=story__title>Glean Usage Dashboard</h1>
  <div class=multiples>
    {#each graphs as {name, type, key, yMax, axisFormat, hoverFormat}, i}
      <div>
        <div class=dg-header>
            <h2>{name}</h2>
            <div>
              {hoverFormat(get(metricData, hoverValue.x ? hoverValue.x : metricData[metricData.length - 1].date, key)[key])}
          </div>
        </div>
        
        <DataGraphic
          width={300}
          height={200}
          top={32}
          left={36}
          right={12}
          xDomain={xDomain} 
          yDomain={[0, yMax]}
          xType=time
          yType=linear
          bind:hoverValue
          on:mousedown={() => {
            mouseDownValue = { ...hoverValue };
          }}
          on:mousemove={() => {
            if (mouseDownValue) {
              mouseMoveValue = { ...hoverValue };
            }
          }}
          on:mouseup={endMouseEvent}
          on:mouseleave={resetMouseClicks}
        >

          <g slot=body-background let:xScale let:yScale let:top let:bottom>
              {#if mouseDownValue.x && mouseMoveValue.x}
              <rect
                transition:fade={{ duration: 75 }}
                x={Math.min(xScale(mouseDownValue.x), xScale(mouseMoveValue.x))}
                y={top}
                width={Math.abs(xScale(mouseDownValue.x) - xScale(mouseMoveValue.x))}
                height={bottom - top}
                fill=var(--pantone-red-100)
              />
              <line 
                x1={xScale(mouseDownValue.x)}
                x2={xScale(mouseDownValue.x)}
                y1={top}
                y2={bottom}
                stroke=var(--pantone-red-200)
                stroke-width=2
              />
              <line 
                x1={xScale(mouseMoveValue.x)}
                x2={xScale(mouseMoveValue.x)}
                y1={top}
                y2={bottom}
                stroke=var(--pantone-red-200)
                stroke-width=2
              />
              <text 
                transition:fade={{ duration: 75 }}
                x={
                  Math.min(xScale(mouseDownValue.x), xScale(mouseMoveValue.x)) + 5
                }
                y={bottom - 5}
                font-size=11
                style="text-transform: uppercase;"
                fill=var(--cool-gray-500)
              >{dateDiff(mouseDownValue.x, mouseMoveValue.x)} days</text>
              {/if}
              <LineBand data={metricData} xAccessor=date yMinAccessor={`${key}Low`}  yMaxAccessor={`${key}High`} />

              
          </g>
          <g style='opacity:.6'>
            <FirefoxReleaseVersionMarkers />
          </g>
          <LeftAxis  tickFormatter={axisFormat} />
          <BottomAxis />

          
          <Line lineDrawAnimation={{ duration: 1200 }} data={metricData} xAccessor=date yAccessor={key} />

          <Springable
            params={{ stiffness: 0.4, damping: 0.9 }}
            value={hoverPt} 
            let:springValue={spr} >
              <g in:fly={{ duration: 1000, y: 200 }}>
                <Point x={spr.date} y={spr[key]} r={3} />
              </g>
              <g in:fade={{ duration: 1000, delay: 300 }}>
                <VerticalErrorBar 
                  x={spr.date} minY={spr[`${key}Low`]} maxY={spr[`${key}High`]}
                />
              </g>
              {#if hoverValue.x}
                <text x={36} y={12} font-size={12}>{dtfmt(spr.date)}</text>
                <text x={500} y={12} font-size={12}>low {spr[`${key}Low`]}</text>
              {/if}

          </Springable>
        </DataGraphic>
      </div>
    {/each}
  </div>

  <div 
    in:fly={{ duration: 500, delay: 1000, y: -10 }}
    style="
    width: 970px;
    display: grid;
    grid-template-columns: auto;
    justify-content: end;
  ">
    <DataGraphic
    width={220}
    height={150}
    xDomain={[0, 1]}
    yDomain={[0, 1]}
    left={60}
    top={0}
    bottom={0}
    right={120}
    xType=linear
    yType=linear
  >
      <Line data={legendData} x=x y=y />
      <LineBand data={legendData} xAccessor=x yMinAccessor=yMin yMaxAccessor=yMax />

      <g slot=annotation let:xScale let:yScale let:left let:right>
        <line x1={right + 10} x2={right + 10}
          y1={yScale(legendData[legendData.length - 1].yMin)} 
          y2={yScale(legendData[legendData.length - 1].yMax)}
          stroke=var(--cool-gray-500)
        />
        <line 
          x1={right + 10} x2={right + 5}
          y1={yScale(legendData[legendData.length - 1].yMin)} 
          y2={yScale(legendData[legendData.length - 1].yMin)}
          stroke=var(--cool-gray-500)
        />
        <line 
          x1={right + 10} x2={right + 5}
          y1={yScale(legendData[legendData.length - 1].yMax)} 
          y2={yScale(legendData[legendData.length - 1].yMax)}
          stroke=var(--cool-gray-500)
        />
        <Point 
          x={legendData[0].x}
          y={legendData[0].y}
        />
        <g style="
          text-transform: uppercase;
          fill: var(--cool-gray-500);
          font-size: 10px;
        ">
          <g style="transform: translate({right + 16}px, {yScale(legendData[legendData.length - 1].y) - 10}px);"
          >
            <text 
              >95% confidence</text>
              <text y={13}
              >interval for</text>
            <text 
              y={26}>point estimate</text>
          </g>
          <g style="
            transform: translate({left - 8}px, {yScale(legendData[0].y) - 0}px);
            text-anchor: end;
          ">
            <text>point</text>
            <text y=13>estimate</text>
        </g>
      </g>
    </DataGraphic>
  </div>
</div>