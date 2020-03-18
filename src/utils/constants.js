import { cubicOut as easing } from 'svelte/easing';

const top = 32;

export const tween = {
  duration: 200,
  easing,
};

const BG = 'var(--cool-gray-subtle)';

export const buildIDComparisonGraph = {
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
  left: buildIDComparisonGraph.left,
  icon: 25,
};

export const totalClientsGraph = {
  top: 12,
  left: buildIDComparisonGraph.left,
  bottom: 24,
  width: buildIDComparisonGraph.width,
  right: buildIDComparisonGraph.right,
  height: 100,
  bgColor: BG,
  borderColor: buildIDComparisonGraph.borderColor,
};

export const explorerComparisonSmallMultiple = {
  width: 145,
  height: buildIDComparisonGraph.height,
  left: 8,
  right: 60,
  top,
  bottom: buildIDComparisonGraph.bottom,
  borderColor: buildIDComparisonGraph.borderColor,
  bgColor: BG,
  insufficientDataAdjustment: buildIDComparisonGraph.insufficientDataAdjustment, // amount of width to add to graph when buildIDComparisonGraph is hidden
};

export const compareClientCountsGraph = {
  top: totalClientsGraph.top,
  left: explorerComparisonSmallMultiple.left,
  right: explorerComparisonSmallMultiple.right,
  bottom: totalClientsGraph.bottom,
  width: explorerComparisonSmallMultiple.width,
  height: totalClientsGraph.height,
  bgColor: BG,
  borderColor: buildIDComparisonGraph.borderColor,
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
