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
    gatherAggregationTypes,
    getDualLabeledSubKeys,
  } from '../../utils/probe-utils';
  import { store, processedMetricKeys, metricKeys } from '../../state/store';

  const dispatch = createEventDispatcher();

  export let data;
  export let probeType;
  export let aggregationLevel = 'build_id';
  export let timeHorizon = 'MONTH';
  export let percentiles = [95, 75, 50, 25, 5];

  let totalAggs = Object.keys(Object.values(data)[0]).length;
  let aggregationTypes = gatherAggregationTypes(data);

  $: currentKey = $store.metricKey;
  $: isDualLabeled = $store.probe.type === 'dual_labeled_counter';
  $: isLabeledMetric =
    $store.probe && $store.probe.type && $store.probe.type.includes('labeled');

  // Local, non-committing selections for label/sub-label to avoid
  // triggering expensive data refetches on every change.
  // These should sync with store values (from URL) but allow local changes
  $: localMetricKey = $store.metricKey || '';
  $: localSubMetricKey = $store.subMetricKey || '';

  // Compute local sub-keys based on local metric key selection
  $: localSubMetricKeys =
    isDualLabeled && localMetricKey && $metricKeys
      ? getDualLabeledSubKeys($metricKeys, localMetricKey)
      : [];

  // When main key changes, clear invalid sub key
  $: {
    if (isDualLabeled) {
      const validSubs = localSubMetricKeys || [];
      if (localSubMetricKey && !validSubs.includes(localSubMetricKey)) {
        localSubMetricKey = '';
      }
    } else {
      localSubMetricKey = '';
    }
  }

  // Apply button enablement
  $: canGo = !!(localMetricKey && (!isDualLabeled || localSubMetricKey));

  function applyKeySelections() {
    if (!canGo) return;
    store.setField('metricKey', localMetricKey);
    if (isDualLabeled) {
      store.setField('subMetricKey', localSubMetricKey);
    } else {
      store.setField('subMetricKey', '');
    }
  }

  // Use full key assembled from the store (applied selection)
  $: currentFullKey = isDualLabeled
    ? `${$store.metricKey}[${$store.subMetricKey}]`
    : $store.metricKey;

  // Local state for dropdown active states
  let mainKeyActive = false;
  let subKeyActive = false;

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

  function filterQuantileData(d, agg, key) {
    return d.filter(
      (di) => di.client_agg_type === agg && di.metric_key === key
    );
  }

  $: selectedData = filterQuantileData(
    data,
    currentAggregation,
    currentFullKey
  );

  $: densityMetricType = getHistogramName(
    $store.productDimensions.normalizationType
  );

  $: pointMetricType =
    probeType === 'log'
      ? getTransformedPercentileName($store.productDimensions.normalizationType)
      : getPercentileName($store.productDimensions.normalizationType);

  const getYDomain = (source, normType) => {
    let range = filterQuantileData(source, currentAggregation, currentFullKey);
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
  $: yDomain = getYDomain(data, $store.productDimensions.normalizationType);
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

  .go-button-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-top: auto;
  }

  .go-button {
    --primary-color: var(--digital-blue-600);
    --primary-color-dark: var(--digital-blue-800);
    --primary-color-light: var(--digital-blue-400);
    --primary-color-lightest: var(--digital-blue-300);
    cursor: pointer;
    font-size: var(--button-text-size);
    text-transform: uppercase;
    border-radius: var(--border-radius-1h);
    padding: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    font-weight: 500;
    margin: 0;
    display: flex;
    column-gap: var(--space-base);
    text-align: center;
    color: white;
    text-decoration: none;
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--cool-gray-200);
  }

  .go-button:hover:not(:disabled) {
    background-color: var(--blue-600);
  }

  .go-button:disabled {
    background-color: var(--cool-gray-300);
    cursor: not-allowed;
    opacity: 0.6;
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
          on:selection={makeSelection('timeHorizon')} />
      {/if}
    </div>

    <div class="body-control-set">
      <label class="body-control-set--label">Probe Value Percentiles</label>
      <PercentileSelectionControl
        {percentiles}
        on:selection={makeSelection('percentiles')} />
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
          {aggregationTypes} />
      </div>
    {/if}

    {#if isLabeledMetric}
      <div class="body-control-set">
        {#if isDualLabeled}
          <label class="body-control-set--label">Key</label>
        {:else}
          <label class="body-control-set--label">Label</label>
        {/if}
        <ProbeKeySelector
          options={$processedMetricKeys || []}
          currentKey={localMetricKey}
          bind:active={mainKeyActive}
          tooltipText="Select a label for this labeled metric"
          disableStoreUpdate={true}
          on:selection={(e) => {
            localMetricKey = e.detail.key;
          }} />
      </div>
    {/if}

    {#if isDualLabeled && localMetricKey}
      <div class="body-control-set">
        <label class="body-control-set--label">Category</label>
        <ProbeKeySelector
          options={localSubMetricKeys || []}
          currentKey={localSubMetricKey}
          bind:active={subKeyActive}
          tooltipText="Select a category for this dual labeled counter"
          fieldName="subMetricKey"
          disableStoreUpdate={true}
          on:selection={(e) => {
            localSubMetricKey = e.detail.key;
          }} />
      </div>
    {/if}

    {#if isLabeledMetric}
      <div class="body-control-set go-button-container">
        <button
          class="go-button"
          disabled={!canGo}
          on:click={applyKeySelections}>Apply</button>
      </div>
    {/if}
    <!-- Debug info: isLabeledMetric={isLabeledMetric}, canGo={canGo}, localMetricKey="{localMetricKey}", localSubMetricKey="{localSubMetricKey}" -->
  </div>
  <div class="data-graphics">
    {#each aggregationTypes as aggType, i (aggType + timeHorizon + currentKey)}
      {#if aggType === currentAggregation}
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
              {interpolate}>
              <div slot="smoother" class="interpolator">
                <input
                  id="toggleSmooth"
                  type="checkbox"
                  bind:checked={interpolate}
                  data-glean-id="interpolate-percentiles" />
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
  </div>
</div>
