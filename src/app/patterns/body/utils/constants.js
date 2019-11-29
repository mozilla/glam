export const buildIDComparisonGraph = {
  width: 425,
  height: 350,
  right: 16,
  bottom: 24,
  insufficientDataAdjustment: 100, // amount of space to remove from graph when hidden
};

export const explorerComparisonSmallMultiple = {
  width: 145,
  height: buildIDComparisonGraph.height,
  left: 8,
  right: 64,
  bottom: buildIDComparisonGraph.bottom,
  insufficientDataAdjustment: buildIDComparisonGraph.insufficientDataAdjustment, // amount of width to add to graph when buildIDComparisonGraph is hidden
};

// for the table views.

export const comparisonSmallMultiple = {
  width: 250,
  height: 50,
  left: 20,
  right: 20,
};

export const proportionSmallMultiple = {
  width: 130,
  height: 16,
};
