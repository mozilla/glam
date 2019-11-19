<script>
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import LeftAxis from '../../../../components/data-graphics/LeftAxis.svelte';
import BottomAxis from '../../../../components/data-graphics/BottomAxis.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import BuildIDRollover from '../../../../components/data-graphics/rollovers/BuildIDRollover.svelte';
import Line from '../../../../components/data-graphics/LineMultiple.svelte';
import ReferenceSymbol from './ReferenceSymbol.svelte';

import FirefoxReleaseVersionMarkers from './FirefoxReleaseVersionMarkers.svelte';

import { buildIDComparisonGraph } from '../utils/constants';

import {
  firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../../components/data-graphics/utils/build-id-utils';

export let data;
export let markers;
export let metricKeys;
export let reference; // used to be latest
export let hovered = {};
export let key; // ???????
export let transform; // extractPercentiles?
export let lineColorMap = () => 'gray'; // percentileLineColorMap
export let strokeWidthMap = () => 1; // percentileLineStrokewidthMap
export let extractMouseoverValues;
export let xDomain;
export let yDomain;
export let yScaleType;
export let yTickFormatter;
export let timeHorizon;


let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

$: if (timeHorizon === 'ALL_TIME') {
  tickFormatter = buildIDToMonth;
  ticks = firstOfMonth;
} else if (timeHorizon === 'MONTH') {
  tickFormatter = buildIDToMonth;
  ticks = mondays;
} else {
  tickFormatter = buildIDToMonth;
  ticks = getFirstBuildOfDays;
}

let transformedData = [];

$: transformedData = transform(metricKeys, data.filter((d) => xDomain.includes(d.label)))
  .map((ps, i) => [ps, metricKeys[i]]);


let xScale;
let yScale;
let H;
let T;
let B;
let bodyHeight;
let topPlot;
let bottomPlot;
let dgRollover;
let margins;

// FIXME: get away from extractMouseoverValue and filter out the unused
// points in the template.
// function createPointSprings(
//   initialValue, keys, extractionFunction, xs, ys,
//   springParams = { damping: 0.9, stiffness: 0.3 },
// ) {
//   function justValues(r) {
//     return r.map((ri) => [(xs ? xs(ri.label) : 0), (ys ? ys(ri.value) : 0)]);
//   }
//   let initial = justValues(keys.map((m) => extractionFunction(m, initialValue)));
//   let values = initial;
//   let keySet = keys;
//   let pointSpring = spring(initial, springParams);

//   const springValues = derived(pointSpring, (arr) => keySet
//     .map((m) => extractionFunction(m, initialValue))
//     .map((v, i) => ({ x: arr[i][0], y: arr[i][1], bin: v.bin })));
//   return {
//     subscribe: springValues.subscribe,
//     setKeys: (k) => {
//       console.log(k);
//       keySet = k;
//       pointSpring.set(values);
//     },
//     setValues: (v) => {
//       values = justValues(keySet.map((m) => extractionFunction(m, v)));
//       pointSpring.set(values);
//     },
//   };
// }

// let's make the reference points spring.
// let refMatches = justValues(metricKeys.map((m) => extractMouseoverValues(m, reference)),
//   xScale, yScale);

// $: refMatches = justValues(metricKeys.map((m) => extractMouseoverValues(m, reference)),
//   xScale, yScale);

// let referenceSpring = spring(refMatches, { damping: 0.9, stiffness: 0.3 });

// $: referenceSpring.set(refMatches);

// const referenceValues = derived(referenceSpring, (arr) => metricKeys
//   .map((m) => extractMouseoverValues(m, reference))
//   .map((v, i) => ({ x: arr[i][0], y: arr[i][1], bin: v.bin })));

// console.log(metricKeys);

// const referenceValues = createPointSprings(
//   reference,
//   metricKeys,
//   extractMouseoverValues,
//   (v) => (xScale ? xScale(v) : 0), // x value
//   (v) => (yScale ? yScale(v) : 0), // y value
// );

// $: referenceValues.setKeys(metricKeys);
// $: referenceValues.setValues(reference);
// $: if (xScale || yScale) referenceValues.setValues(reference);


// let's make the current reference label spring.
let refLabelPlacement = 0;
$: refLabelPlacement = xScale ? xScale(reference.label) : 0;
const refLabelSpring = spring(refLabelPlacement, { damping: 0.9, stiffness: 0.3 });
$: refLabelSpring.set(refLabelPlacement);


function initiateRollover(rolloverStore) { // eslint-disable-line
  if (!rolloverStore) return undefined;
  derived(rolloverStore, ({ x, y }) => {
    // we need the whole data point?
    // use only x to fetch the data point.
    const datum = data.find((d) => d.label === x);
    return { x, y, datum };
  }).subscribe((st) => {
    hovered = st;
  });
}

let dataGraphicMounted;

$: if (dataGraphicMounted) {
  initiateRollover(dgRollover);
  T.subscribe((t) => { topPlot = t; });
  B.subscribe((b) => { bottomPlot = b; });
  H.subscribe((h) => { bodyHeight = h; });
}

</script>

 <DataGraphic
 data={data}
 xDomain={xDomain}
 yDomain={yDomain}
 yType={yScaleType}
 width={buildIDComparisonGraph.width}
 height={buildIDComparisonGraph.height}
 bottom={buildIDComparisonGraph.bottom}
 bind:rollover={dgRollover}
 bind:xScale={xScale}
 bind:yScale={yScale}
 bind:bodyHeight={H}
 bind:topPlot={T}
 bind:bottomPlot={B}
 bind:margins={margins}
 right={buildIDComparisonGraph.right}
 key={key}
 bind:dataGraphicMounted={dataGraphicMounted}
 on:click={() => {
   if (hovered.datum) reference = hovered.datum;
 }}
>

{#if hovered.x && xScale && topPlot && bodyHeight}
<BuildIDRollover 
 x={hovered.x}
 label={hovered.datum.label}
/>

  <rect x={xScale(hovered.x) - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
    fill="var(--cool-gray-100)" />
  {/if}
  <rect x={$refLabelSpring - xScale.step() / 2} y={topPlot} width={xScale.step()} height={bodyHeight}
    fill="var(--cool-gray-100)" />
 <LeftAxis tickFormatter={yTickFormatter} tickCount=6 />
 <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />

 <!-- <TopAxis showLabels=false showBorder=true /> -->

 <GraphicBody>
   {#each transformedData as
     [lineData, key], i (key)}
       <Line
       curve="curveStep"
       lineDrawAnimation={{ duration: 300 }} 
       xAccessor="label"
       yAccessor={'value'}
       strokeWidth={strokeWidthMap(key)}
       color={lineColorMap(key)}
       data={lineData} />
     {/each}
 </GraphicBody>

 {#if hovered.datum && extractMouseoverValues}
 {#each metricKeys.map((m) => extractMouseoverValues(m, hovered.datum)) as {label, bin, value}, i (bin)}
  <circle 
  cx={xScale(label)}
  cy={yScale(value)}
  r=2
  stroke="none"
  fill={lineColorMap(bin)}
  />

  {/each}

 {/if}
 {#each metricKeys.map((m) => extractMouseoverValues(m, reference)) as {bin, value, label}, i (bin)}
    <ReferenceSymbol
    size={20}
    xLocation={xScale(label)} yLocation={yScale(value)} color={lineColorMap(bin)} 
  />
  {/each}
<!-- transform="rotate(90 {xScale(reference.label) + margins.buffer} {topPlot + margins.buffer})" -->

  <text
    text-anchor="end"
    font-size=12
    x={$refLabelSpring - margins.buffer} y={bottomPlot - margins.buffer} fill={hovered.datum ? 'var(--cool-gray-600)' : 'var(--cool-gray-300)'}>ref.</text>


  <FirefoxReleaseVersionMarkers />

</DataGraphic>