<script>
import { derived } from 'svelte/store';

import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import LeftAxis from '../../../../components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../../components/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from '../../../../components/data-graphics/GraphicBody.svelte';
import Line from '../../../../components/data-graphics/elements/Line.svelte';

import FirefoxReleaseVersionMarkers from './FirefoxReleaseVersionMarkers.svelte';


import { buildIDComparisonGraph } from '../utils/constants';

import {
  firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../utils/build-id-utils';

import {
  clientCounts,
} from '../../../utils/probe-utils';


export let data;
export let xDomain;
export let timeHorizon;
export let reference;
export let hovered = false;

let margins;
let tickFormatter;
let ticks;
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

let transformed = clientCounts(data);
$: transformed = clientCounts(data);

let yScale;
let xScale;

// get yDomain?

let yVals = transformed.map((d) => d.totalClients);
let yDomain = [Math.min(...yVals), Math.max(...yVals)];

let dataGraphicMounted;
let L;
let T;
let BW;
let BH;
let leftPlot;
let topPlot;
let bodyWidth;
let bodyHeight;

$: if (dataGraphicMounted) {
  L.subscribe((l) => { leftPlot = l; });
  T.subscribe((t) => { topPlot = t; });
  BW.subscribe((bw) => { bodyWidth = bw; });
  BH.subscribe((bh) => { bodyHeight = bh; });
}

</script>

<style>
div {
  opacity:.2;
}

.hovered {
  opacity: 1;
}
</style>

<div class:hovered={hovered}>
  <DataGraphic
    yType="linear"
    xDomain={xDomain}
    yDomain={yDomain}
    width={buildIDComparisonGraph.width}
    height={60}
    left={buildIDComparisonGraph.left}
    right={buildIDComparisonGraph.right}
    bind:xScale
    bind:yScale
    bind:leftPlot={L}
    bind:topPlot={T}
    bind:bodyWidth={BW}
    bind:bodyHeight={BH}
    bind:margins
    bind:dataGraphicMounted={dataGraphicMounted}
    top={8}
  >
    <!-- <LeftAxis tickCount={2} /> -->
    <BottomAxis  ticks={ticks} tickFormatter={tickFormatter} />
    <rect 
      x={leftPlot}
      y={topPlot}
      width={bodyWidth}
      height={bodyHeight}
      fill=var(--cool-gray-100)
    />
    <Line 
      curve="curveStep"
      data={transformed} 
      xAccessor='label' 
      yAccessor="totalClients"
      color="var(--cool-gray-500)"
      areaColor="var(--cool-gray-300)"
      area={true} />
    <FirefoxReleaseVersionMarkers labels={false} />
    <text
      x={leftPlot + margins.buffer}
      y={topPlot + 10 + margins.buffer / 2}
      fill=var(--cool-gray-500)
      font-size=10
    >client count</text>
  </DataGraphic>
</div>