
export default function whichSmallMultiple(probeType, probeKind) {
  if (probeType === 'histogram') {
    if (probeKind === 'exponential' || probeKind === 'linear') {
      return 'quantile';
    }
  }
  if (probeType === 'scalar' && probeKind === 'uint') return 'quantile';
  return 'proportion';
}
