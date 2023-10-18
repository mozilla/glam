<script>
  import { percentileLineColorMap } from '../../utils/color-maps';
  import TableView from './TableView.svelte';
  import AggregationTypeSelector from '../controls/AggregationTypeSelector.svelte';
  import ProbeKeySelector from '../controls/ProbeKeySelector.svelte';
  import { formatCount, formatPercentDecimal } from '../../utils/formatters';
  import {
    gatherProbeKeys,
    gatherAggregationTypes,
  } from '../../utils/probe-utils';
  import { PERCENTILES } from '../../utils/constants';

  export let data;
  export let probeType = 'categorical';
  export let aggregationLevel = 'build_id';

  export let aggregationTypes = gatherAggregationTypes(data);
  export let probeKeys = gatherProbeKeys(data);
  export let colorMap;
  export let visibleBuckets;
  export let bucketOptions;
  export let densityMetricType;

  let currentKey = probeKeys[0];
  let currentAggregation = aggregationTypes[0];

  function filterResponseData(d, agg, key) {
    return d.filter(
      (di) => di.client_agg_type === agg && di.metric_key === key
    );
  }

  $: selectedData = filterResponseData(data, currentAggregation, currentKey);
</script>

<style>
  .body-content {
    margin-top: var(--space-2x);
  }
</style>

<div class="body-content">
  <slot />

  {#if (aggregationTypes && aggregationTypes.length > 2) || (probeKeys && probeKeys.length > 1)}
    <div
      style="
      display:grid;
      grid-auto-flow: column;
      justify-content: start;
      grid-column-gap: var(--space-4x);
      margin-top: var(--space-4x);
      margin-bottom: var(--space-4x);
      padding-left: var(--space-4x);
      padding-right: var(--space-4x);
    "
    >
      {#if aggregationTypes && aggregationTypes.length > 1}
        <div class="body-control-set">
          <label class="body-control-set--label">Metric Type</label>
          <AggregationTypeSelector {aggregationTypes} bind:currentAggregation />
        </div>
      {/if}

      {#if probeKeys && probeKeys.length > 1}
        <div class="body-control-set">
          <label class="body-control-set--label">Key</label>
          <ProbeKeySelector options={probeKeys} bind:currentKey />
        </div>
      {/if}
    </div>
  {/if}
  <TableView
    data={selectedData}
    {aggregationLevel}
    {densityMetricType}
    colorMap={probeType === 'categorical' ? colorMap : percentileLineColorMap}
    {bucketOptions}
    visibleBuckets={probeType === 'categorical' ? visibleBuckets : PERCENTILES}
    keyFormatter={probeType === 'categorical' ? (v) => v : (v) => `${v}%`}
    valueFormatter={probeType === 'categorical'
      ? formatPercentDecimal
      : formatCount}
    key={probeType === 'categorical' ? 'proportions' : 'percentiles'}
    tooltipFormatter={probeType === 'categorical'
      ? () => undefined
      : (v) => `${v}th percentile`}
    bucketTypeLabel={probeType === 'categorical' ? 'categories' : 'percentiles'}
  />
</div>
