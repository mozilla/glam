function uniques(d, k) {
  return Array.from(new Set(d.map((di) => di[k])));
}

export function gatherProbeKeys(d) {
  // return Object.keys(nestedData);
  return uniques(d, 'metric_key');
}

export function gatherAggregationTypes(d) {
  // return Object.keys(Object.values(nestedData)[0]);
  return uniques(d, 'client_agg_type');
}
