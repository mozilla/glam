export const noDuplicates = (payload, aggregationMethod = 'build_id') => {
  // go through ever data
  // look at data[...].metadata[aggregationMethod]. There should be no duplicates.
  const allBuildIDs = payload.response.map((di) => di.metadata[aggregationMethod]);
  const uniques = new Set(allBuildIDs);
  if (allBuildIDs.length !== uniques.size) {
    throw new Error(`Duplicate ${aggregationMethod === 'build_id' ? 'Build IDs' : 'Versions'} found.`);
  }
};

export const noResponse = (payload, probeIsActive) => {
  if (!('response' in payload)) {
    const er = new Error('The data for this probe is unavailable.');
    if (!probeIsActive) er.moreInformation = 'This probe appears to be inactive, so it\'s possible we don\'t have data for it.';
    throw er;
  }
};

export function validate(data, ...validators) {
  validators.forEach((check) => { check(data); });
}
