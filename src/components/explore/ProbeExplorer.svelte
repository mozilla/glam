<script>
import { writable } from 'svelte/store';
import { format } from 'd3-format';

import Violin from 'udgl/data-graphics/elements/Violin.svelte';
import CompareOverTimeGraph from './CompareOverTimeGraph.svelte';
// import TotalClientsGraph from './TotalClientsGraph.svelte';
import DistributionComparison from './DistributionComparison.svelte';
import ComparisonSummary from './ComparisonSummary.svelte';

import { explorerComparisonSmallMultiple } from '../../utils/constants';

import { formatBuildIDToDateString } from '../../utils/formatters';

import { histogramSpring } from '../../utils/animation';

export let data;
export let title;
export let markers;
export let key;
export let timeHorizon;
export let aggregationLevel;
export let activeBins = [50];
export let showViolins = true;
export let binColorMap;
export let pointMetricType;
export let overTimePointMetricType = pointMetricType;
export let yScaleType;
export let yDomain;
export let densityMetricType;
export let yTickFormatter = format(',d');
export let comparisonKeyFormatter = (v) => v;

// If there isn't more than one other point to compare,
// let's turn off the hover.
let hoverActive = data.length > 2;
$: hoverActive = data.length > 2;

// If insufficient data, suppress the main graph
// and blow up the other.
let insufficientData = data.length <= 2;
$: insufficientData = data.length <= 2;

let domain = writable(aggregationLevel === 'version' ? data.map((d) => d.label) : [
  new Date(Math.min(...data.map((d) => d.label))), new Date(Math.max(...data.map((d) => d.label))),
]);

function setDomain(str) {
  if (aggregationLevel === 'build_id') {
    const start = str === 'ALL_TIME' ? new Date(+data[0].label) : new Date(+data[data.length - 1].label);
    const end = new Date(+data[data.length - 1].label);

    let daysAgo = str === 'WEEK' ? 7 : 30;
    if (str !== 'ALL_TIME') {
      start.setDate(start.getDate() - daysAgo);
    }
    domain.set([start, end]);
  } else {
    const start = data[data.length - 1].label;
    let filtered = data;
    let daysAgo = str === 'WEEK' ? 7 : 31;
    if (str !== 'ALL_TIME') {
      start.setDate(start.getDate() - daysAgo);
      filtered = data.filter((d) => d.label >= start);
    }
    domain.set(filtered.map((d) => d.label));
  }
}

$: if (aggregationLevel === 'build_id') {
  setDomain(timeHorizon);
}

export let hovered = !hoverActive ? { x: data[0].label, datum: data[0] } : {};

export let reference = data[data.length - 1];
// $: if (timeHorizon) reference = data[data.length - 1];

// This will lightly animate the reference distribution part of the violin plot.
// FIXME: for quantile plots, let's move this up a level to the view.
// This is pretty inelegant.
let animatedReferenceDistribution = writable(0);
$: if (densityMetricType) {
  animatedReferenceDistribution = histogramSpring(reference[densityMetricType]);
}
$: if (densityMetricType && reference[densityMetricType]) {
  animatedReferenceDistribution.setValue(reference[densityMetricType]);
}
</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content max-content auto;
}

.no-line-chart {
  grid-template-columns: max-content auto;
  justify-items: start;
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

.probe-body-overview {
  display:grid;
  grid-template-columns: auto max-content;
  grid-column-gap: var(--space-4x);
  justify-items: start;
  margin-bottom: var(--space-4x);
}

</style>


<div class='probe-body-overview'>
  <div>
    <!-- <h4>
      <slot name='title'>
        {title}
      </slot>
    </h4> -->
  </div>
  <slot name='summary'></slot>
</div>

<div class=graphic-and-summary class:no-line-chart={insufficientData}>
    <div style="display: {insufficientData ? 'none' : 'block'}">
      <CompareOverTimeGraph
        data={data}
        xDomain={$domain}
        yDomain={yDomain}
        timeHorizon={timeHorizon}
        lineColorMap={binColorMap}
        key={key}
        yAccessor={overTimePointMetricType}
        xScaleType={aggregationLevel === 'version' ? 'scalePoint' : 'time'}
        yScaleType={yScaleType}
        yTickFormatter={yTickFormatter}
        metricKeys={activeBins}
        bind:reference={reference}
        bind:hovered={hovered}
        markers={markers}
        aggregationLevel={aggregationLevel}
        hoverActive={hoverActive}
        insufficientData={insufficientData}
    >
      <slot name=additional-plot-elements></slot>
    </CompareOverTimeGraph>
  </div>

  <DistributionComparison 
    yScaleType={yScaleType}
    leftLabel={aggregationLevel === 'build_id' && hovered.x ? formatBuildIDToDateString(hovered.x) : hovered.x}
    rightLabel={aggregationLevel === 'build_id' ? formatBuildIDToDateString(reference.label) : reference.label}
    colorMap={binColorMap}
    yTickFormatter={yTickFormatter}
    leftPoints={hovered.datum ? hovered.datum[pointMetricType] : undefined}
    rightPoints={reference[pointMetricType]}
    activeBins={activeBins}
    yDomain={yDomain}
    dataVolume={data.length}
  >
    <!-- add violin plots on the quantiles -->
    
    <g slot='body' let:left={lp} let:right={rp}>
      {#if showViolins}
        {#if hovered.datum || insufficientData}
          <Violin
            orientation="vertical"
            showLeft={false}
            rawPlacement={(rp - lp) / 2 + lp - Boolean(data.length > 2)}
            key={hovered.x}
            opacity=.9
            density={insufficientData ? data[0][densityMetricType] : hovered.datum[densityMetricType]} 
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
      {/if}
    </g>
  </DistributionComparison>
  
  <ComparisonSummary 
    hovered={!!hovered.datum}
    left={hovered.datum ? hovered.datum[pointMetricType] : hovered.datum} 
    right={reference[pointMetricType]}
    leftLabel={aggregationLevel === 'build_id' && hovered.x ? formatBuildIDToDateString(hovered.x) : hovered.x}
    rightLabel={aggregationLevel === 'build_id' ? formatBuildIDToDateString(reference.label) : reference.label}
    keySet={activeBins}
    colorMap={binColorMap}
    valueFormatter={yTickFormatter}
    keyFormatter={comparisonKeyFormatter}
    dataVolume={data.length}
    showLeft={data.length > 1}
    showDiff={data.length > 1}
  />

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
    