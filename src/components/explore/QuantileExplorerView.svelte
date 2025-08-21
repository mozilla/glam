<script>
  import { setContext, createEventDispatcher } from 'svelte';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions/tooltip';
  import { Warning } from '@graph-paper/icons';
  import { percentileLineColorMap } from '../../utils/color-maps';
  import ProbeExplorer from './ProbeExplorer.svelte';
  import PercentileSelectionControl from '../controls/PercentileSelectionControl.svelte';
  import TimeHorizonControl from '../controls/TimeHorizonControl.svelte';
  import AggregationTypeSelector from '../controls/AggregationTypeSelector.svelte';
  import ProbeKeySelector from '../controls/ProbeKeySelector.svelte';
  import { firefoxVersionMarkers } from '../../state/product-versions';
  import {
    overTimeTitle,
    percentilesOverTimeDescription,
  } from '../../utils/constants';
  import {
    getPercentileName,
    getHistogramName,
    getTransformedPercentileName,
  } from '../../config/shared';

  import {
    gatherProbeKeys,
    gatherAggregationTypes,
    gatherDualLabeledProbeKeyMap,
    transformDualLabeledData,
  } from '../../utils/probe-utils';
  import { store } from '../../state/store';

  const dispatch = createEventDispatcher();

  export let data;
  export let probeType;
  export let aggregationLevel = 'build_id';
  export let timeHorizon = 'MONTH';
  export let percentiles = [95, 75, 50, 25, 5];

  let isDualLabeled = $store.probe.type === 'dual_labeled_counter';
  let transformedData = isDualLabeled ? transformDualLabeledData(data) : data;
  let totalAggs = Object.keys(Object.values(transformedData)[0]).length;

  let aggregationTypes = gatherAggregationTypes(transformedData);
  const dualLabeledKeys = gatherDualLabeledProbeKeyMap(transformedData);
  let probeKeys = gatherProbeKeys(transformedData);

  let currentKey = $store.aggKey || probeKeys[0];
  $: currentSubKey = dualLabeledKeys[currentKey]
    ? dualLabeledKeys[currentKey][0]
    : null;

  let currentAggregation = aggregationTypes.includes('summed_histogram')
    ? 'summed_histogram'
    : $store.aggType;

  let aggregationInfo;

  let interpolate = false;

  setContext('probeType', probeType);

  function makeSelection(type) {
    return function onSelection(event) {
      dispatch('selection', { selection: event.detail.selection, type });
    };
  }

  function filterQuantileData(d, agg, key, subKey) {
    return d.filter(
      (di) =>
        di.client_agg_type === agg &&
        di.metric_key === key &&
        (!subKey || di.nested_metric_key === subKey)
    );
  }

  $: selectedData = filterQuantileData(
    transformedData,
    currentAggregation,
    currentKey,
    currentSubKey
  );

  $: densityMetricType = getHistogramName(
    $store.productDimensions.normalizationType
  );

  $: pointMetricType =
    probeType === 'log'
      ? getTransformedPercentileName($store.productDimensions.normalizationType)
      : getPercentileName($store.productDimensions.normalizationType);

  const getYDomain = (source, normType) => {
    let range = filterQuantileData(
      source,
      currentAggregation,
      currentKey,
      currentSubKey
    );
    let histogramRange = range[range.length - 1][
      getHistogramName(normType)
    ].map((d) => d.bin);
    let percentileRange = [
      1,
      Math.max(
        ...range.map(
          (d) =>
            d[getPercentileName(normType)] && d[getPercentileName(normType)][95]
        )
      ),
    ];
    return probeType === 'log' ? histogramRange : percentileRange;
  };
  $: yDomain = getYDomain(
    transformedData,
    $store.productDimensions.normalizationType
  );
</script>

<style>
  .body-content {
    margin-top: var(--space-2x);
  }

  .data-graphics {
    margin-top: var(--space-4x);
  }

  .small-multiple {
    margin-bottom: var(--space-8x);
  }

  .interpolator {
    display: flex;
    align-items: initial;
    padding-right: 50px;
    place-content: center;
  }

  .interpolator input {
    margin-right: 5px;
    margin-bottom: 0px;
  }

  .interpolator h3 {
    padding-right: 5px;
  }
</style>

<div class="body-content">
  <slot />

  <div class="body-control-row  body-control-row--stretch">
    <div class="body-control-set">
      {#if aggregationLevel === 'build_id'}
        <label class="body-control-set--label">Time Horizon</label>
        <TimeHorizonControl
          horizon={timeHorizon}
          on:selection={makeSelection('timeHorizon')}
        />
      {/if}
    </div>

    <div class="body-control-set">
      <label class="body-control-set--label">Probe Value Percentiles</label>
      <PercentileSelectionControl
        {percentiles}
        on:selection={makeSelection('percentiles')}
      />
    </div>
  </div>

  <div class="body-control-row">
    <!-- FIXME: this is a workaround because there is a summed_histogram and a summed-histogram -->
    {#if totalAggs > 1 && currentAggregation !== 'summed_histogram' && currentAggregation !== 'summed-histogram'}
      <div class="body-control-set">
        <label class="body-control-set--label">aggregation</label>
        <AggregationTypeSelector
          bind:aggregationInfo
          bind:currentAggregation
          {aggregationTypes}
        />
      </div>
    {/if}
    {#if probeKeys && probeKeys.length > 1}
      <div class="body-control-set">
        {#if isDualLabeled}
          <label class="body-control-set--label">Key</label>
        {:else}
          <label class="body-control-set--label">Label</label>
        {/if}
        <ProbeKeySelector options={probeKeys} bind:currentKey />
      </div>
    {/if}
    {#if isDualLabeled}
      <div class="body-control-set">
        <label class="body-control-set--label">Category</label>
        <ProbeKeySelector
          options={dualLabeledKeys[currentKey]}
          tooltipText="this probe allows for multiple sub keys"
          bind:currentKey={currentSubKey}
        />
      </div>
    {/if}
  </div>
  <div class="data-graphics">
    {#each probeKeys as key, i (key)}
      {#each aggregationTypes as aggType, i (aggType + timeHorizon + key)}
        {#if key === currentKey && aggType === currentAggregation}
          {#key interpolate}
            <div class="small-multiple">
              <ProbeExplorer
                aggregationsOverTimeTitle={overTimeTitle(
                  'percentiles',
                  aggregationLevel
                )}
                aggregationsOverTimeDescription={percentilesOverTimeDescription(
                  aggregationLevel
                )}
                summaryLabel="perc."
                normalizedData={selectedData}
                activeBins={percentiles}
                {timeHorizon}
                markers={$firefoxVersionMarkers}
                showViolins={true}
                {aggregationLevel}
                binColorMap={percentileLineColorMap}
                {pointMetricType}
                overTimePointMetricType={pointMetricType}
                {densityMetricType}
                comparisonKeyFormatter={(perc) => `${perc}%`}
                yScaleType={probeType === 'log' ? 'scalePoint' : 'linear'}
                {yDomain}
                {interpolate}
              >
                <div slot="smoother" class="interpolator">
                  <input
                    id="toggleSmooth"
                    type="checkbox"
                    bind:checked={interpolate}
                    data-glean-id="interpolate-percentiles"
                  />
                  <h3 for="toggleSmooth" class="data-graphic__element-title">
                    Interpolated
                  </h3>
                  <span
                    use:tooltipAction={{
                      text: 'Generates percentiles using the Between Closest Ranks Linear Interpolation. WARNING: ONLY USE THIS WHEN THE PROBE DISTRIBUTION IS CONTINUOUS AND THE DATA WITHIN BUCKETS IS UNIFORMLY DISTRIBUTED. OTHERWISE THIS CAN SHOW INACCURATE OR MISLEADING RESULTS.',
                      location: 'top',
                    }}
                    class="data-graphic__element-title__icon"
                    ><Warning size={14} />
                  </span>
                </div>
              </ProbeExplorer>
            </div>
          {/key}
        {/if}
      {/each}
    {/each}
  </div>
</div>
