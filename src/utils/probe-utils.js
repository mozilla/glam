import { LOW_CLIENT_COUNT_NIGHTLY } from './constants';

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

export function transformDualLabeledData(d) {
  // Only keep entries with metric_key that contains '[' and ']'
  const validDualLabeledKeys = d.filter(
    (di) => di.metric_key.includes('[') && di.metric_key.includes(']')
  );
  return validDualLabeledKeys.map((di) => {
    const [outsideKey, insideKeyWithBracket] = di.metric_key.split('[');
    const insideKey = insideKeyWithBracket.split(']')[0];
    return { ...di, metric_key: outsideKey, nested_metric_key: insideKey };
  });
}

export function gatherDualLabeledProbeKeyMap(d) {
  const keyMap = {};
  d.forEach((di) => {
    if (
      !keyMap[di.metric_key] ||
      !keyMap[di.metric_key].includes(di.nested_metric_key)
    ) {
      keyMap[di.metric_key] = [
        ...(keyMap[di.metric_key] || []),
        di.nested_metric_key,
      ];
    }
  });
  return keyMap;
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
  let sum = data.reduce((a, b) => a + b.value, 0);
  sum = sum === 0 ? 1 : sum;
  return data.map((a) => ({ bin: a.bin, value: a.value / sum }));
}

export function convertValueToProportions(obj) {
  const newObj = { ...obj };

  // Calculate the total of all values
  let total = Object.values(newObj).reduce((a, b) => a + b, 0);
  total = total === 0 ? 1 : total;
  // Convert each value to a proportion of the total
  Object.keys(newObj).forEach((key) => {
    newObj[key] /= total;
  });
  return newObj;
}

export function filterLowClientBuilds(data) {
  // Parse the YYYYMMDD prefix as a local-midnight Date. Using the multi-arg
  // Date constructor avoids the ISO-string codepath, which would otherwise
  // interpret "YYYY-MM-DD" as UTC and shift the day in negative-offset
  // timezones (e.g. a build from May 2 would land on May 1 20:00 in EDT).
  function getBuildDate(buildId) {
    return new Date(
      parseInt(buildId.substring(0, 4), 10),
      parseInt(buildId.substring(4, 6), 10) - 1,
      parseInt(buildId.substring(6, 8), 10)
    );
  }
  // Counter / labeled_counter rows are repeated once per client_agg_type
  // (sum/avg/count/min/max) with the same total_users in each — they're all
  // aggregations over the same user set. Restrict the sum to a single
  // client_agg_type so the threshold compares against an honest per-build
  // user count instead of a 5×-inflated one. All metric_keys still count
  // toward that single number.
  const aggTypeForCounting = data[0]?.client_agg_type;
  const totalUsersPerBuild = data.reduce((acc, d) => {
    if (d.client_agg_type !== aggTypeForCounting) return acc;
    acc[d.build_id] = (acc[d.build_id] || 0) + d.total_users;
    return acc;
  }, {});

  // Floor the cutoff to local midnight so the comparison with getBuildDate
  // (also at local midnight) is a day-level check, not a sliding window.
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 4);
  return data.filter(
    (d) =>
      totalUsersPerBuild[d.build_id] >= LOW_CLIENT_COUNT_NIGHTLY ||
      getBuildDate(d.build_id) >= cutoff
  );
}
