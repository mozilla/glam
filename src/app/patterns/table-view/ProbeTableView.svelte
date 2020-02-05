<script>
import TableView from './TableView.svelte';
import AggregationTypeSelector from '../../../routes/_components/AggregationTypeSelector.svelte';
import ProbeKeySelector from '../../../routes/_components/ProbeKeySelector.svelte';
import { percentileLineColorMap } from '../../../components/data-graphics/utils/color-maps';
import { formatCount, formatPercentDecimal } from '../../../utils/formatters';

export let data;
export let probeType = 'categorical';
export let aggregationLevel = 'build_id';


function gatherProbeKeys(nestedData) {
  return Object.keys(nestedData);
}

function gatherAggregationTypes(nestedData) {
  return Object.keys(Object.values(nestedData)[0]);
}

export let aggregationTypes = gatherAggregationTypes(data);
export let probeKeys = gatherProbeKeys(data);
export let colorMap;
export let visibleBuckets;

// FIXME: summed-histogram must go.
let currentAggregation = (aggregationTypes.includes('summed_histogram') ? 'summed_histogram' : aggregationTypes[0]) || undefined;
let currentKey = probeKeys[0] || undefined;
// aggregation

// probe key

</script>

<style>
.body-content {
  margin-top: var(--space-2x);
}
</style>

<div class=body-content>

<slot></slot>

  {#if (aggregationTypes && aggregationTypes.length > 2) || (probeKeys && probeKeys.length > 1)}
  <div style="
      display:grid; 
      grid-auto-flow: column; 
      justify-content: start; 
      grid-column-gap: var(--space-4x);
      margin-top: var(--space-4x);
      margin-bottom: var(--space-4x);
      padding-left: var(--space-4x);
      padding-right: var(--space-4x);
    ">
      {#if aggregationTypes && aggregationTypes.length > 1}
      <div class=body-control-set>
        <label class=body-control-set--label>Metric Type</label>
        <AggregationTypeSelector 
          aggregationTypes={aggregationTypes}
          bind:currentAggregation={currentAggregation}
        />
      </div>
      {/if}

      {#if probeKeys && probeKeys.length > 1}
      <div class=body-control-set>
        <label class=body-control-set--label>Key</label>
        <ProbeKeySelector 
          options={probeKeys}
          bind:currentKey={currentKey}
        />
      </div>
      {/if}
  </div>
  {/if}
  <TableView 
    data={data}
    aggregationLevel={aggregationLevel}
    colorMap={probeType === 'categorical' ? colorMap : percentileLineColorMap}
    visibleBuckets={probeType === 'categorical' ? visibleBuckets : [5, 25, 50, 75, 95]}
    keyFormatter={probeType === 'categorical' ? (v) => v : (v) => `${v}%`}
    valueFormatter={probeType === 'categorical' ? formatPercentDecimal : formatCount}
    key={probeType === 'categorical' ? 'proportions' : 'percentiles'}
    currentKey={currentKey}
    currentAggregation={currentAggregation}
    tooltipFormatter={probeType === 'categorical' ? () => undefined : (v) => `${v}th percentile`}
    bucketTypeLabel={probeType === 'categorical' ? 'categories' : 'percentiles'}
  />


</div>