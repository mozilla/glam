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
  clientVolume: 'Client Volume',
  sampleVolume: 'Sample Count Volume',
};

export function overTimeTitle(metricType, aggregationLevel) {
  return `${niceMetricTypes[metricType]} by ${niceAggregations[aggregationLevel]}`;
}

export function exploreInstructionsDescription(aggregationLevel) {
  return `
  Hover to compare to reference ⭑; click to set reference ⭑
  to hovered ${niceAggregations[aggregationLevel]} ●.
  Right-click to perform actions from reference ⭑ to hovered ●.
  `;
}

export function percentilesOverTimeDescription(aggregationLevel) {
  return `
  Shows the percentile values for the following probe
  aggregation by ${niceAggregations[aggregationLevel]}.

  ${exploreInstructionsDescription(aggregationLevel)}
  `;
}

export function proportionsOverTimeDescription(
  overTimePointMetricType,
  aggregationLevel
) {
  return `
  Shows the ${overTimePointMetricType} of clients that have observed the
  following category / bin for the probe for each given ${
    niceAggregations[aggregationLevel]
  }.

  ${exploreInstructionsDescription(aggregationLevel)}
  `;
}

export function volumeOverTimeDescription(aggregationLevel, countView) {
  return `
  Shows the total volume of ${countView} that have observed this probe for each given ${
    niceAggregations[aggregationLevel]
  }.

  ${exploreInstructionsDescription(aggregationLevel)}
  `;
}

export function clientProportionOverTimeDescription(aggregationLevel) {
  return `Proportion of Clients by ${niceAggregations[aggregationLevel]}`;
}

export function compareDescription(chartName) {
  return `Compares the reference ⭑ to the hovered value ● in the "${chartName}" chart`;
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
  // amount of width to add to graph when buildIDComparisonGraph is hidden
  insufficientDataAdjustment:
    aggregationsOverTimeGraph.insufficientDataAdjustment,
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

export const distributionComparisonGraph = {
  width: 1300,
  height: 200,
  left: 0,
  right: 0,
  top: 35,
  bottom: 20,
  borderColor: aggregationsOverTimeGraph.borderColor,
  bgColor: BG,
  // amount of width to add to graph when buildIDComparisonGraph is hidden
  insufficientDataAdjustment:
    aggregationsOverTimeGraph.insufficientDataAdjustment,
};

export const PERCENTILES = [0.1, 1, 5, 25, 50, 75, 95, 99, 99.9];
