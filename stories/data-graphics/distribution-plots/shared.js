
export const sortByHistogramObjectKey = (a, b) => {
  const ai = +a;
  const bi = +b;
  if (ai < bi) return -1;
  if (ai >= bi) return 1;
  return 0;
};

export const responseHistogramToGraphicFormat = (histogram, keyTransform = (k) => +k) => {
  // turn histogram to array of objects, sorted.
  const formatted = Object.entries(histogram).map(([k, v]) => ({ bin: keyTransform(k), value: v }));
  formatted.sort((a, b) => {
    if (a.key > b.key) return -1;
    if (a.key <= b.key) return 1;
    return 0;
  });
  return formatted;
};

export const makeDataset = (probeData, key = 'version') => probeData.map((probe) => ({
  label: probe.metadata[key],
  histogram: responseHistogramToGraphicFormat(probe.data[0].histogram),
  percentiles: responseHistogramToGraphicFormat(probe.data[0].percentiles),
}));
