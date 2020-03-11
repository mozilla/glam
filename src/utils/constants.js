
const top = 32;
export const buildIDComparisonGraph = {
  width: 425,
  height: 350,
  right: 16,
  left: 60,
  bottom: 40,
  top,
  insufficientDataAdjustment: 100, // amount of space to remove from graph when hidden
};

export const explorerComparisonSmallMultiple = {
  width: 145,
  height: buildIDComparisonGraph.height,
  left: 8,
  right: 64,
  top,
  bottom: buildIDComparisonGraph.bottom,
  insufficientDataAdjustment: buildIDComparisonGraph.insufficientDataAdjustment, // amount of width to add to graph when buildIDComparisonGraph is hidden
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
