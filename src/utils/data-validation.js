export const noUnknownMetrics = (metricType, supportedMetrics = []) => {
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

export const noUseCounters = (probeName = '') => {
  if (/^use[._]?counter/i.test(probeName)) {
    const er = new Error('Use counters are not supported here.');
    er.moreInformation =
      'Due to the way it aggregates data, GLAM is not the best place to view use counters.';
    er.link = {
      url: 'https://mozilla.github.io/use-counters/',
      text: 'Use the Use Counters Dashboard instead.',
    };
    throw er;
  }
};

export const noResponse = (payload, probeIsActive) => {
  if (!('response' in payload)) {
    const er = new Error('The data for this probe is unavailable.');
    er.noData = true;
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

// isLabeled scopes the message to the selected label, since only that label's
// data was fetched.
export const noMeaningfulData = (data, isLabeled = false) => {
  if (data.length === 0) {
    const er = new Error(
      isLabeled
        ? 'There is no meaningful data for this label in this probe.'
        : 'There is no meaningful data for this probe.'
    );
    er.noData = true;
    er.moreInformation = isLabeled
      ? 'This label has not accumulated a significant amount of data for a reliable aggregation.'
      : 'This probe has not accumulated a significant amount of data for a reliable aggregation.';
    throw er;
  }
};
