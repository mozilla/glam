<script>
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import { format } from 'd3-format';

import BuildIDComparison from '../elements/BuildIDComparison.svelte';
import TotalClientsGraph from '../elements/TotalClientsGraph.svelte';
import DistributionComparison from '../elements/DistributionComparison.svelte';
import ComparisonSummary from '../elements/ComparisonSummary.svelte';
import Violin from '../../../../components/data-graphics/ViolinPlotMultiple.svelte';

import { explorerComparisonSmallMultiple } from '../utils/constants';

import { formatBuildIDToDateString } from '../utils/formatters';

import { percentileLineColorMap } from '../../../../components/data-graphics/utils/color-maps';

import { histogramSpring } from '../utils/animation';


import {
  buildIDToDate,
} from '../../../../components/data-graphics/utils/build-id-utils';


import { extractPercentiles } from '../../../../components/data-graphics/utils/percentiles';

export let data;
export let title;
export let markers;
export let key;
export let timeHorizon;
export let aggregationLevel;
export let percentiles = [50];

// If there isn't more than one other point to compare,
// let's turn off the hover.
let hoverActive = data.length > 2;
$: hoverActive = data.length > 2;

// If insufficient data, suppress the main graph
// and blow up the other.
let insufficientData = data.length <= 2;
$: insufficientData = data.length <= 2;

let valueFmt = format(',.2f');
let countFmt = format(',d');

const probeType = getContext('probeType');

let yScaleType;
let yDomain;
let whichPercentileVersion = 'transformedPercentiles';
if (probeType === 'histogram') {
  yScaleType = 'scalePoint';
  yDomain = data[0].histogram.map((d) => d.bin);
} else if (probeType === 'scalar') {
  yScaleType = 'log';
  let upperDomain = Math.max(...data.map((d) => d.percentiles[95]));
  yDomain = [0, upperDomain];
  whichPercentileVersion = 'percentiles';
}

// FIXME: after demo remove this requirement
// data = data.slice(0, -1);

let domain = writable(data.map((d) => d.label));

function setDomain(str) {
  const start = buildIDToDate(data[data.length - 1].label);
  let filtered = data;
  let daysAgo = str === 'WEEK' ? 7 : 30;
  if (str !== 'ALL_TIME') {
    start.setDate(start.getDate() - daysAgo);
    filtered = data.filter((d) => buildIDToDate(d.label) >= start);
  }
  domain.set(filtered.map((d) => d.label));
}

$: if (aggregationLevel === 'build_id') setDomain(timeHorizon);

let hovered = !hoverActive ? { x: data[0].label, datum: data[0] } : {};
let reference = data[data.length - 1];

const movingAudienceSize = tweened(0, { duration: 500, easing });
const refMedian = tweened(reference.percentiles[50], { duration: 500, easing });
$: movingAudienceSize.set(reference.audienceSize);
$: refMedian.set(reference.percentiles[50]);

function getPercentile(datum) {
  let out = {};
  out = probeType === 'histogram' ? { ...datum.transformedPercentiles } : { ...datum.percentiles };
  Object.keys(out).forEach((k) => {
    out[k] = { y: out[k], x: datum.label };
  });
  return out;
}

// This will lightly animate the reference distribution part of the violin plot.
const animatedReferenceDistribution = histogramSpring(reference.histogram);
$: if (reference.histogram) animatedReferenceDistribution.setValue(reference.histogram);

</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content max-content auto;
}

.summary {
  display:grid;
  grid-auto-flow:column;
  justify-content: end;
  font-size: 14px;
}

h4 {
  padding: 0px;
  margin:0px;
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.title-and-summary {
  display:grid;
  grid-template-columns: auto max-content max-content;
  grid-column-gap: var(--space-4x);
  justify-items: start;
  margin-bottom: var(--space-4x);
}

.bignum {
  width: max-content;
}

.bignum__label {
  font-size: var(--text-015);
  text-transform: uppercase;
  color: var(--cool-gray-500);
}

.bignum__value {
  font-size: var(--text-06);
  text-align: right;
}
</style>


<div class='title-and-summary'>
  <div>
    <h4>{title}</h4>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Ref. Median (50th perc.)</div>
    <div class=bignum__value>{valueFmt($refMedian)}</div>
  </div>
  <div class=bignum>
    <div class=bignum__label>⭑ Total Clients</div>
    <div class=bignum__value>{countFmt($movingAudienceSize)}</div>
  </div>
</div>

<div class=graphic-and-summary>
  <div style="visibility: {insufficientData ? 'hidden' : 'visible'}">
    <BuildIDComparison
      data={data}
      xDomain={$domain}
      yDomain={yDomain}
      timeHorizon={timeHorizon}
      lineColorMap={percentileLineColorMap}
      key={key}
      yScaleType={yScaleType}
      transform={(p, d) => extractPercentiles(p, d, whichPercentileVersion)}
      metricKeys={percentiles}
      bind:reference={reference}
      bind:hovered={hovered}
      extractMouseoverValues={getPercentile}
      markers={markers}
      aggregationLevel={aggregationLevel}
      hoverActive={hoverActive}
      insufficientData={insufficientData}
    />
  </div>

  <DistributionComparison 
    yType={yScaleType}
    leftLabel={aggregationLevel === 'build_id' && hovered.x ? formatBuildIDToDateString(hovered.x) : hovered.x}
    rightLabel={aggregationLevel === 'build_id' ? formatBuildIDToDateString(reference.label) : reference.label}
    colorMap={(v) => percentileLineColorMap(+v)}
    leftPoints={hovered.datum ? hovered.datum.percentiles : undefined}
    rightPoints={reference.percentiles}
    activeBins={percentiles}
    yDomain={yDomain}
    dataVolume={data.length}
  >
    <!-- add violin plots on the quantiles -->
    <g slot='body' let:leftPlot={lp} let:rightPlot={rp}>
      {#if hovered.datum}
        <Violin
          orientation="vertical"
          showLeft={false}
          rawPlacement={(rp - lp) / 2 + lp - Boolean(data.length > 2)}
          key={hovered.x}
          opacity=.9
          density={hovered.datum.histogram} 
          densityAccessor='value'
          valueAccessor='bin'
          densityRange={[0,
            (explorerComparisonSmallMultiple.width
            - explorerComparisonSmallMultiple.left
            - explorerComparisonSmallMultiple.right) / 2 - 5]}
          areaColor="var(--digital-blue-400)"
          lineColor="var(--digital-blue-500)"
        />
      {/if}
      {#if reference}
        <Violin
          orientation="vertical"
          showRight={false}
          rawPlacement={(rp - lp) / 2 + lp + Boolean(data.length > 2)}
          opacity=.9
          key={reference.label}
          density={$animatedReferenceDistribution} 
          densityAccessor='value'
          valueAccessor='bin'
          densityRange={[0, (explorerComparisonSmallMultiple.width
            - explorerComparisonSmallMultiple.left
            - explorerComparisonSmallMultiple.right) / 2 - 5]}
          areaColor="var(--digital-blue-400)"
          lineColor="var(--digital-blue-500)"
        />
      {/if}
    </g>
  </DistributionComparison>
  
  <ComparisonSummary 
    hovered={!!hovered.datum}
    left={hovered.datum ? hovered.datum.percentiles : hovered.datum} 
    right={reference.percentiles}
    leftLabel={aggregationLevel === 'build_id' && hovered.x ? formatBuildIDToDateString(hovered.x) : hovered.x}
    rightLabel={aggregationLevel === 'build_id' ? formatBuildIDToDateString(reference.label) : reference.label}
    keySet={percentiles}
    colorMap={percentileLineColorMap}
    valueFormatter={valueFmt}
    keyFormatter={(perc) => `${perc}%`}
    dataVolume={data.length}
    showLeft={data.length > 1}
    showDiff={data.length > 1}
  >
  </ComparisonSummary>

  <!-- <TotalClientsGraph 
    data={data}
    xDomain={$domain}
    timeHorizon={timeHorizon}
    key={key}
    yScaleType={yScaleType}
    metricKeys={percentiles}
    hovered={!!hovered.datum}
    reference={reference}
    markers={markers}
  /> -->

</div>
    