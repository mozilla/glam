export const noUnknownMetrics = (supportedMetrics = [], metricType) => {
  // Ensure the probe metric type is in our list of `probeView`s.
  if (!supportedMetrics.includes(metricType)) {
    const er = new Error('This metric type is currently unsupported.');
    er.moreInformation =
      `GLAM doesn't yet know how to aggregate "${metricType}" type metrics. ` +
      'If you seeing aggregations of metrics of this type would be valuable for you, ' +
      'or if you believe this is an error, please let us know.';
    throw er;
  }
};

export const noResponse = (payload, probeIsActive) => {
  if (!('response' in payload)) {
    const er = new Error('The data for this probe is unavailable.');
    if (!probeIsActive)
      er.moreInformation =
        "This probe appears to be inactive, so it's possible we don't have data for it.";
    throw er;
  }
};

export function validate(data, ...validators) {
  validators.forEach((check) => {
    check(data);
  });
}
