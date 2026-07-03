import { filterLowClientBuilds } from '../src/utils/probe-utils';
import { LOW_CLIENT_COUNT_NIGHTLY } from '../src/utils/constants';

describe('filterLowClientBuilds', () => {
  // A build_id well before the 4-day cutoff, so builds only survive the filter
  // via the client-count threshold, never via recency.
  const olderBuildId = (n) => `202001${String(n).padStart(2, '0')}`;

  const summedHistogramRow = (buildId, totalUsers) => ({
    build_id: buildId,
    metric_key: '',
    client_agg_type: 'summed_histogram',
    total_users: totalUsers,
  });

  const legacyRow = (buildId, metricKey, totalUsers, agg) => ({
    build_id: buildId,
    metric_key: metricKey,
    client_agg_type: agg || 'sum',
    total_users: totalUsers,
  });

  it('counts static labeled_counter builds by their summed_histogram total_users, not the inflated legacy rows', () => {
    // A transition build carries a sparse summed_histogram row (below threshold)
    // alongside legacy scalar rows whose total_users is the old pipeline's much
    // larger client set. It must be filtered out on the summed_histogram count.
    const lowBuild = olderBuildId(1);
    const data = [
      legacyRow(lowBuild, 'recoverable', 5000, 'sum'),
      legacyRow(lowBuild, 'recoverable', 5000, 'avg'),
      legacyRow(lowBuild, 'recoverable', 5000, 'count'),
      summedHistogramRow(lowBuild, LOW_CLIENT_COUNT_NIGHTLY - 1),
    ];
    expect(filterLowClientBuilds(data)).toEqual([]);
  });

  it('keeps a transition build whose summed_histogram count clears the threshold', () => {
    const highBuild = olderBuildId(2);
    const data = [
      legacyRow(highBuild, 'recoverable', 5000, 'sum'),
      summedHistogramRow(highBuild, LOW_CLIENT_COUNT_NIGHTLY + 1),
    ];
    // Every row for the surviving build is retained (legacy + new).
    expect(filterLowClientBuilds(data)).toHaveLength(2);
  });

  it('falls back to legacy counting for builds without a summed_histogram row', () => {
    const legacyOnly = olderBuildId(3);
    const data = [
      legacyRow(legacyOnly, 'recoverable', LOW_CLIENT_COUNT_NIGHTLY + 1, 'sum'),
      legacyRow(legacyOnly, 'recoverable', LOW_CLIENT_COUNT_NIGHTLY + 1, 'avg'),
    ];
    expect(filterLowClientBuilds(data)).toHaveLength(2);
  });

  it('does not 5x-inflate legacy-only counts across client_agg_types', () => {
    // Same total_users repeated per agg type must be counted once, so a build
    // just under the threshold is still filtered out.
    const legacyOnly = olderBuildId(4);
    const perAgg = Math.ceil((LOW_CLIENT_COUNT_NIGHTLY - 1) / 5);
    const data = ['sum', 'avg', 'count', 'min', 'max'].map((agg) =>
      legacyRow(legacyOnly, 'recoverable', perAgg, agg)
    );
    expect(filterLowClientBuilds(data)).toEqual([]);
  });

  it('leaves non-labeled-counter probes (no summed_histogram) unchanged in behavior', () => {
    const low = olderBuildId(5);
    const high = olderBuildId(6);
    const data = [
      {
        build_id: low,
        metric_key: '',
        client_agg_type: 'histogram',
        total_users: 10,
      },
      {
        build_id: high,
        metric_key: '',
        client_agg_type: 'histogram',
        total_users: LOW_CLIENT_COUNT_NIGHTLY + 1,
      },
    ];
    const result = filterLowClientBuilds(data);
    expect(result.map((d) => d.build_id)).toEqual([high]);
  });

  it('keeps recent low-client builds regardless of count', () => {
    const today = new Date();
    const buildId = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const data = [summedHistogramRow(buildId, 1)];
    expect(filterLowClientBuilds(data)).toHaveLength(1);
  });
});
