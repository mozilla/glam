export function clientCounts(arr) {
  return arr.map((a) => ({ totalClients: a.audienceSize, label: a.label }));
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
