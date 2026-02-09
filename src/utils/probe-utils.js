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
  function getBuildDate(buildId) {
    return new Date(
      `${buildId.substring(0, 4)}
      -${buildId.substring(4, 6)}
      -${buildId.substring(6, 8)}`
    );
  }
  // Sums up the total_users for each build and filters out builds with low client counts

  const totalUsersPerBuild = data.reduce((acc, d) => {
    acc[d.build_id] = (acc[d.build_id] || 0) + d.total_users;
    return acc;
  }, {});

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const threeDaysAgo = new Date(yesterday - 3 * 24 * 60 * 60 * 1000);
  return data.filter(
    (d) =>
      totalUsersPerBuild[d.build_id] >= LOW_CLIENT_COUNT_NIGHTLY ||
      getBuildDate(d.build_id) >= threeDaysAgo
  );
}
