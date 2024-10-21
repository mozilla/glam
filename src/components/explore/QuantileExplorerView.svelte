<script>
  import { setContext, createEventDispatcher } from 'svelte';

  import { tooltip as tooltipAction } from '@graph-paper/core/actions/tooltip';
  import { Help } from '@graph-paper/icons';
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
  } from '../../utils/probe-utils';
  import { store } from '../../state/store';

  const dispatch = createEventDispatcher();

  export let data;
  export let probeType;
  export let aggregationLevel = 'build_id';

  let totalAggs = Object.keys(Object.values(data)[0]).length;

  export let timeHorizon = 'MONTH';
  export let percentiles = [95, 75, 50, 25, 5];

  let aggregationTypes = gatherAggregationTypes(data);
  let probeKeys = gatherProbeKeys(data);

  let currentKey = $store.aggKey || probeKeys[0];
  let currentAggregation = aggregationTypes.includes('summed_histogram')
    ? 'summed_histogram'
    : $store.aggType;

  let aggregationInfo;

  let smoothnessLevel = false; // Only on/off now but intention is to be a gradient.

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

  $: selectedData = filterQuantileData(data, currentAggregation, currentKey);

  $: densityMetricType = getHistogramName(
    $store.productDimensions.normalizationType
  );

  $: pointMetricType =
    probeType === 'log'
      ? getTransformedPercentileName($store.productDimensions.normalizationType)
      : getPercentileName($store.productDimensions.normalizationType);

  const getYDomain = (source, normType) => {
    let range = filterQuantileData(source, currentAggregation, currentKey);
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

  .interpolator label {
    color: var(--cool-gray-700);
    margin-right: 5px;
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
        <label class="body-control-set--label">Key</label>
        <ProbeKeySelector options={probeKeys} bind:currentKey />
      </div>
    {/if}
  </div>
  <div class="data-graphics">
    {#each probeKeys as key, i (key)}
      {#each aggregationTypes as aggType, i (aggType + timeHorizon + key)}
        {#if key === currentKey && aggType === currentAggregation}
          {#key smoothnessLevel}
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
                {smoothnessLevel}
              >
                <div slot="smoother" class="interpolator">
                  <input
                    id="toggleSmooth"
                    type="checkbox"
                    bind:checked={smoothnessLevel}
                  />
                  <h3 for="toggleSmooth" class="data-graphic__element-title">
                    Interpolate
                  </h3>
                  <span
                    use:tooltipAction={{
                      text: 'Applies a moving average to smooth out short-term fluctuations on percentile values.',
                      location: 'top',
                    }}
                    class="data-graphic__element-title__icon"
                    ><Help size={14} />
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
