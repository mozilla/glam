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

// Parse metric keys for dual labeled counters
export function parseDualLabeledMetricKeys(metricKeys) {
  // Filter to only keys that contain '[' and ']'
  const validKeys = metricKeys.filter(
    (key) => key.includes('[') && key.includes(']')
  );

  const keyMap = {};
  validKeys.forEach((key) => {
    const [mainKey, subKeyWithBracket] = key.split('[');
    const subKey = subKeyWithBracket.split(']')[0];

    if (!keyMap[mainKey]) {
      keyMap[mainKey] = [];
    }
    if (!keyMap[mainKey].includes(subKey)) {
      keyMap[mainKey].push(subKey);
    }
  });

  return keyMap;
}

// Get main keys from dual labeled metric keys
export function getDualLabeledMainKeys(metricKeys) {
  const keyMap = parseDualLabeledMetricKeys(metricKeys);
  return Object.keys(keyMap);
}

// Get sub keys for a specific main key
export function getDualLabeledSubKeys(metricKeys, mainKey) {
  const keyMap = parseDualLabeledMetricKeys(metricKeys);
  return keyMap[mainKey] || [];
}

// Reconstruct the full metric key for API calls
export function reconstructDualLabeledKey(mainKey, subKey) {
  return `${mainKey}[${subKey}]`;
}
