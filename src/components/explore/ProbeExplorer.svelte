<script>
import { writable } from 'svelte/store';
import { format } from 'd3-format';

import { window1D } from 'udgl/data-graphics/utils/window-functions';
import ToplineMetrics from './ToplineMetrics.svelte';

import AggregationsOverTimeGraph from './AggregationsOverTimeGraph.svelte';
import AggregationComparisonGraph from './AggregationComparisonGraph.svelte';

import ClientVolumeOverTimeGraph from './ClientVolumeOverTimeGraph.svelte';
import CompareClientVolumeGraph from './CompareClientVolumeGraph.svelte';

import ComparisonSummary from './ComparisonSummary.svelte';

import AdHocViolin from './AdHocViolin.svelte';

import {
  explorerComparisonSmallMultiple,
  overTimeTitle,
  clientVolumeOverTimeDescription as clientDescription,
  compareDescription,
} from '../../utils/constants';


import {
  formatBuildIDToDateString,
} from '../../utils/formatters';

import {
  clientCounts,
} from '../../utils/probe-utils';

import { histogramSpring } from '../../utils/animation';

export let data;
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
export let summaryNumberFormatter = yTickFormatter;
export let comparisonKeyFormatter = (v) => v;
export let summaryLabel = 'perc.';

const VIOLIN_PLOT_OFFSET = 7; // this is for padding our ad hoc violin

export let aggregationsOverTimeTitle;
export let aggregationsOverTimeDescription;
export let clientVolumeOverTimeTitle = overTimeTitle('clientVolume', aggregationLevel);
export let clientVolumeOverTimeDescription = clientDescription(aggregationLevel);

// If there isn't more than one other point to compare,
// let's turn off the hover.
let hoverActive = data.length > 2;
$: hoverActive = data.length > 2;

// If insufficient data, suppress the main graph
// and blow up the other.
let insufficientData = data.length <= 2;
$: insufficientData = data.length <= 2;
$: justOne = data.length === 1;

let domain = writable(aggregationLevel === 'version' ? data.map((d) => d.label) : [
  Math.min(...data.map((d) => d.label)), Math.max(...data.map((d) => d.label)),
  // new Date(Math.min(...data.map((d) => d.label))), new Date(Math.max(...data.map((d) => d.label))),
]);

function setDomain(str) {
  if (aggregationLevel === 'build_id') {
    // const start = str === 'ALL_TIME' ? new Date(+data[0].label) : new Date(+data[data.length - 1].label);
    // const start = data[0].label;
    // const end = data[data.length - 1].label;
    // console.log([start, end]);
    // domain.set([start, end]);
    const labels = data.map((di) => di.label);
    domain.set(labels);
    // const end = new Date(+data[data.length - 1].label);

  //   let daysAgo = str === 'WEEK' ? 7 : 30;
  //   if (str !== 'ALL_TIME') {
  //     start.setDate(start.getDate() - daysAgo);
  //   }
  //   domain.set([start, end]);
  // } else {
  //   const start = data[data.length - 1].label;
  //   let filtered = data;
  //   let daysAgo = str === 'WEEK' ? 7 : 31;
  //   if (str !== 'ALL_TIME') {
  //     start.setDate(start.getDate() - daysAgo);
  //     filtered = data.filter((d) => d.label >= start);
  //   }
  //   domain.set(filtered.map((d) => d.label));
  }
}

$: if (aggregationLevel === 'build_id') {
  setDomain(timeHorizon);
}

export let hovered = !hoverActive ? { x: data[0].label, datum: data[0] } : {};

function leftLabelForAggComparison(d, aggLevel, x) {
  if (d.length === 2) return d[0].label;
  if (aggLevel === 'build_id') return x;// formatBuildIDToDateString(x);
  return x;
}

function leftPointsForAggComparison(d, pmt, dt) {
  if (d.length === 2) return d[0][pmt];
  if (d.length > 2 && dt) return dt[pmt];
  return undefined;
}

export let reference = data[data.length - 1];

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

// client counts.
const MULT = 1.1;
$: clientCountsData = clientCounts(data);
$: yVals = clientCountsData.map((d) => d.totalClients);
$: yMax = Math.max(50, Math.max(...yVals));
$: yClientsDomain = [0, yMax * MULT];


// setting hovered value.
function get(d, x) {
  return window1D({
    data: d, value: x, lowestValue: $domain[0], highestValue: $domain[1],
  });
}
let hoverValue = {};
$: if (hoverValue.x) {
  const i = get(data, hoverValue.x);
  hovered = {
    ...hoverValue,
    datum: data[i.currentIndex],
    previous: data[i.previousIndex],
    next: data[i.nextIndex],
  };
} else {
  hovered = {};
}

</script>

<style>
.graphic-and-summary {
  display: grid;
  grid-template-columns: max-content max-content auto;
  grid-row-gap: var(--space-2x);
}

.no-line-chart {
  justify-items: start;
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
  <ToplineMetrics {reference} hovered={data.length > 2 ? hovered.datum : data[0]} dataLength={data.length} {aggregationLevel} />
  <slot name='summary'></slot>
</div>

<div class=graphic-and-summary class:no-line-chart={insufficientData}>
    <div style="display: {insufficientData ? 'none' : 'block'}">
      <AggregationsOverTimeGraph
        title={aggregationsOverTimeTitle}
        description={aggregationsOverTimeDescription}
        data={data}
        xDomain={$domain}
        yDomain={yDomain}
        timeHorizon={timeHorizon}
        lineColorMap={binColorMap}
        key={key}
        yAccessor={overTimePointMetricType}
        xScaleType={aggregationLevel === 'version' ? 'scalePoint' : 'scalePoint'}
        yScaleType={yScaleType}
        yTickFormatter={yTickFormatter}
        metricKeys={activeBins}
        reference={reference}
        hovered={hovered}
        bind:hoverValue
        markers={markers}
        aggregationLevel={aggregationLevel}
        hoverActive={hoverActive}
        insufficientData={insufficientData}
        on:click={() => {
          if (hovered.datum) {
            reference = hovered.datum;
          }
        }}
    >
      <slot name=additional-plot-elements></slot>
    </AggregationsOverTimeGraph>
  </div>

  <AggregationComparisonGraph
    description={compareDescription(aggregationsOverTimeTitle)}
    yScaleType={yScaleType}
    leftLabel={leftLabelForAggComparison(data, aggregationLevel, hovered.x)}
    rightLabel={(aggregationLevel === 'build_id') ? formatBuildIDToDateString(reference.label) : reference.label}
    colorMap={binColorMap}
    yTickFormatter={yTickFormatter}
    leftPoints={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
    rightPoints={reference[pointMetricType]}
    activeBins={activeBins}
    yDomain={yDomain}
    dataVolume={data.length}
    showTopAxis={!justOne}
  >
    <!-- add violin plots on the quantiles -->

    <g slot='glam-body' let:top let:bottom let:left={lp} let:right={rp} let:yScale>
      {#if showViolins}
        {#if hovered.datum && (!justOne)}
        <AdHocViolin
          start={
            ((lp + rp) / 2) - (explorerComparisonSmallMultiple.width
            - explorerComparisonSmallMultiple.left
            - explorerComparisonSmallMultiple.right) / 2 + VIOLIN_PLOT_OFFSET
          }
          direction={-1}
          density={((data.length < 3) || !hovered.datum) ? data[0][densityMetricType] : hovered.datum[densityMetricType]}
          width={
            (explorerComparisonSmallMultiple.width
          - explorerComparisonSmallMultiple.left
          - explorerComparisonSmallMultiple.right) / 2 - VIOLIN_PLOT_OFFSET} />
        {/if}
        {#if reference && reference[densityMetricType]}
              <AdHocViolin
                start={justOne ? lp : (lp + rp) / 2}
                density={reference[densityMetricType]}
                width={
                justOne

                  ? rp - lp - VIOLIN_PLOT_OFFSET * 2

                  : (explorerComparisonSmallMultiple.width
                - explorerComparisonSmallMultiple.left
                - explorerComparisonSmallMultiple.right) / 2 - VIOLIN_PLOT_OFFSET} />
        {/if}
        {#if !justOne}
        <line
          x1={(lp + rp) / 2} x2={(lp + rp) / 2} y1={top} y2={bottom} stroke=var(--digital-blue-150)
        />
      {/if}
      {/if}
    </g>
  </AggregationComparisonGraph>

  <ComparisonSummary
    hovered={data.length === 2 || !!hovered.datum}
    left={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
    right={reference[pointMetricType]}
    leftLabel={data.length === 2 ? 'PREV.' : 'HOV.'}
    rightLabel={data.length <= 2 ? 'LATEST' : 'REF.'}
    binLabel={summaryLabel}
    keySet={activeBins}
    colorMap={binColorMap}
    valueFormatter={summaryNumberFormatter}
    keyFormatter={comparisonKeyFormatter}
    dataVolume={data.length}
    showLeft={data.length > 1}
    showDiff={data.length > 1}
  />
  <div style="display: {insufficientData ? 'none' : 'block'}">
    <ClientVolumeOverTimeGraph
      title={clientVolumeOverTimeTitle}
      description={clientVolumeOverTimeDescription}
      data={clientCountsData}
      xDomain={$domain}
      yDomain={yClientsDomain}
      timeHorizon={timeHorizon}
      aggregationLevel={aggregationLevel}
      key={key}
      yScaleType={yScaleType}
      metricKeys={activeBins}
      hovered={hovered}
      reference={reference}
      bind:hoverValue
      markers={markers}
      on:click={() => {
        if (hovered.datum) {
          reference = hovered.datum;
        }
      }}
    />
  </div>
  <div style="display: {insufficientData ? 'none' : 'block'}">
    <CompareClientVolumeGraph
      data={clientCountsData}
      description={compareDescription(clientVolumeOverTimeTitle)}
      yDomain={yClientsDomain}
      hoverValue={hovered.datum ? hovered.datum.audienceSize : 0}
      referenceValue={reference.audienceSize}
    />
  </div>

</div>
