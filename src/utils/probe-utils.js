export function clientCounts(arr) {
  return arr.map((a) => ({ totalClients: a.audienceSize, label: a.label }));
}

export function sampleCounts(arr) {
  return arr.map((a) => ({
    totalSample: a.sample_count ? a.sample_count : 0,
    label: a.label,
  }));
}

function uniques(d, k) {
  return Array.from(new Set(d.map((di) => di[k])));
}

export function gatherProbeKeys(d) {
  return uniques(d, 'metric_key');
}

export function gatherAggregationTypes(d) {
  return uniques(d, 'client_agg_type');
}

export function isSelectedProcessValid(processes, selectedProcess) {
  let process = selectedProcess;
  if (process === 'all_childs') {
    process = 'parent';
  }

  return processes.includes(process);
}

export function convertValueToPercentage(data) {
  const sum = data.reduce((a, b) => a + b.value, 0);
  return data.map((a) => ({ bin: a.bin, value: a.value / sum }));
}

export function convertValueToProportions(obj) {
  const newObj = { ...obj };

  // Calculate the total of all values
  const total = Object.values(newObj).reduce((a, b) => a + b, 0);
  // Convert each value to a proportion of the total
  Object.keys(newObj).forEach((key) => {
    newObj[key] /= total;
  });
  return newObj;
}
