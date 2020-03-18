import { cubicOut as easing } from 'svelte/easing';

const top = 32;

export const tween = {
  duration: 200,
  easing,
};

// descriptions for the individual charts.

const niceAggregations = {
  build_id: 'Build ID',
  version: 'version',
};

const niceMetricTypes = {
  percentiles: 'Percentiles',
  counts: 'Client Counts',
  proportions: 'Proportions',
};

export function overTimeTitle(metricType, aggregationLevel) {
  // const mt = metricType.charAt(0).toUpperCase() + metricType.slice(1);
  return `${niceMetricTypes[metricType]} by ${niceAggregations[aggregationLevel]}`;
}

export function percentilesOverTimeDescription(aggregationLevel) {
  return `
  Shows the percentile values for the following probe
  aggregation by ${niceAggregations[aggregationLevel]}.
  `;
}

export function proportionsOverTimeDescription(overTimePointMetricType, aggregationLevel) {
  return `
  Shows the ${overTimePointMetricType} of clients that have observed the 
  following category / bin for the probe, grouped by ${niceAggregations[aggregationLevel]}.
  `;
}

export function clientVolumeOverTimeDescription(aggregationLevel) {
  return `Volume of Clients by ${niceAggregations[aggregationLevel]}`;
}

export function clientProportionOverTimeDescription(aggregationLevel) {
  return `Proportion of Clients by ${niceAggregations[aggregationLevel]}`;
}

// layout constants for the explore charts

const BG = 'var(--cool-gray-subtle)';

export const aggregationsOverTimeGraph = {
  width: 425,
  height: 325,
  right: 16,
  left: 60,
  bottom: 24,
  top,
  borderColor: 'var(--cool-gray-400)',
  insufficientDataAdjustment: 100, // amount of space to remove from graph when hidden
};

export const toplineRefLabel = {
  left: aggregationsOverTimeGraph.left,
  icon: 25,
};

export const totalClientsGraph = {
  top: 12,
  left: aggregationsOverTimeGraph.left,
  bottom: 24,
  width: aggregationsOverTimeGraph.width,
  right: aggregationsOverTimeGraph.right,
  height: 100,
  bgColor: BG,
  borderColor: aggregationsOverTimeGraph.borderColor,
};

export const explorerComparisonSmallMultiple = {
  width: 145,
  height: aggregationsOverTimeGraph.height,
  left: 8,
  right: 60,
  top,
  bottom: aggregationsOverTimeGraph.bottom,
  borderColor: aggregationsOverTimeGraph.borderColor,
  bgColor: BG,
  insufficientDataAdjustment: aggregationsOverTimeGraph.insufficientDataAdjustment, // amount of width to add to graph when buildIDComparisonGraph is hidden
};

export const compareClientCountsGraph = {
  top: totalClientsGraph.top,
  left: explorerComparisonSmallMultiple.left,
  right: explorerComparisonSmallMultiple.right,
  bottom: totalClientsGraph.bottom,
  width: explorerComparisonSmallMultiple.width,
  height: totalClientsGraph.height,
  bgColor: BG,
  borderColor: aggregationsOverTimeGraph.borderColor,
};

// for the table views.

export const comparisonSmallMultiple = {
  width: 200,
  height: 50,
  left: 20,
  right: 20,
};

export const proportionSmallMultiple = {
  width: 80,
  height: 16,
};
