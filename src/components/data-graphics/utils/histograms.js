/* eslint-disable import/prefer-default-export */
export const telemetryHistogramToHeatmap = (dataset, normalize = false) => {
  const out = [];
  dataset.forEach((h) => {
    const x = h.label;
    const hists = h.histogram.map((hi) => ({ ...hi })).filter((hi) => hi.value > 0.0);
    if (normalize) {
      const heats = hists.map((hi) => hi.value);
      const maxHeat = Math.max(...heats, 1);
      const minHeat = Math.min(...heats, 0);
      hists.forEach((hi) => {
        hi.value = (hi.value - minHeat) / (maxHeat - minHeat); // eslint-disable-line
      });
    }
    hists.forEach(({ bin, value }) => {
      out.push({
        x, y: bin, heat: value,
      });
    });
  });
  return out;
};
