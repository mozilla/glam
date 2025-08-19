<script>
  import { createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut as easing } from 'svelte/easing';

  import { store } from '../../state/store';

  import ProbeExplorer from './ProbeExplorer.svelte';
  import TimeHorizonControl from '../controls/TimeHorizonControl.svelte';
  import ProportionMetricTypeControl from '../controls/ProportionMetricTypeControl.svelte';

  import CategoricalMenu from './CategoricalMenu.svelte';

  import {
    formatPercent,
    formatCount,
    formatPercentDecimal,
  } from '../../utils/formatters';
  import {
    overTimeTitle,
    proportionsOverTimeDescription,
  } from '../../utils/constants';
  import {
    gatherProbeKeys,
    gatherAggregationTypes,
  } from '../../utils/probe-utils';
  import { numericStringsSort } from '../../utils/sort';
  import {
    getHistogramName,
    getProportionName,
    getCountName,
    numHighlightedBuckets,
  } from '../../config/shared';

  export let aggregationLevel = 'build_id';
  export let data;
  export let probeType;
  export let activeBuckets;
  export let bucketColorMap;
  export let bucketOptions;
  export let timeHorizon = 'MONTH';
  export let metricType = 'proportions';

  export let bucketSortOrder = (a, b) => (a < b ? 1 : -1);

  const dispatch = createEventDispatcher();

  function makeSelection(type) {
    return function onSelection(event) {
      dispatch('selection', { selection: event.detail.selection, type });
    };
  }

  let aggregationTypes = gatherAggregationTypes(data);
  let probeKeys = gatherProbeKeys(data);
  let currentKey = probeKeys[0];
  let currentAggregation = aggregationTypes[0];

  function filterResponseData(d, agg, key) {
    return d.filter(
      (di) =>
        di.client_agg_type === agg && (key === '' || di.metric_key === key)
    );
  }

  $: selectedData = filterResponseData(data, currentAggregation, currentKey);

  // set the audience size when the reference updates.
  let ref;
  const movingAudienceSize = tweened(0, { duration: 500, easing });
  $: if (ref) movingAudienceSize.set(ref.audienceSize);

  $: if (currentKey && ref) {
    if (selectedData[currentKey] !== undefined) {
      const r = selectedData[currentKey][currentAggregation].find(
        (d) => d.label.toString() === ref.label.toString()
      );
      ref = r;
    }
  }
  let showOptionMenu = false;
  let coloredBuckets = [];
  let everActiveBuckets = [];
  let sortedImportantBuckets = [];
  let sortedUnimportantBuckets = [];

  if (bucketOptions.length > numHighlightedBuckets) {
    showOptionMenu = true;
    const lastDataset = data[data.length - 1];

    coloredBuckets = Object.entries(
      lastDataset[getCountName($store.productDimensions.normalizationType)]
    )
      .sort(([bucketAName, bucketAValue], [bucketBName, bucketBValue]) => {
        const bucketValueDifference = bucketAValue - bucketBValue;
        if (bucketValueDifference === 0) {
          return bucketBName - bucketAName;
        }
        return bucketValueDifference;
      })
      .slice(-numHighlightedBuckets)
      .map(([bucket]) => bucket);
  }
  let selectAllCategories = false;

  $: if (showOptionMenu) {
    everActiveBuckets = [...new Set([...activeBuckets, ...everActiveBuckets])];

    // An important bucket is any bucket that:
    //
    //   (a) is colored
    //   (b) is currently active
    //   (c) has been active at some point in the past
    //
    // Rule (c) improves usability: if the user goes out of their way to enable a
    // bucket that we consider to be unimportant, we should consider it to be
    // important for the rest of the interaction. If we did not do this, the bucket
    // would switch between the important group and the unimportant group as it's
    // toggled, which would be annoying.
    sortedImportantBuckets = [
      ...new Set([...everActiveBuckets, ...coloredBuckets]),
    ].sort(numericStringsSort);

    // An unimportant bucket is any other bucket
    sortedUnimportantBuckets = bucketOptions
      .filter((bucket) => !sortedImportantBuckets.includes(bucket))
      .sort(numericStringsSort);
  }

  $: densityMetricType = getHistogramName(
    $store.productDimensions.normalizationType
  );
  $: selectAllCategories = $store.activeBuckets.length === bucketOptions.length;
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
</style>

<div class="body-content">
  <slot />
  <div class="body-control-row body-control-row--stretch">
    <div class="body-control-set">
      {#if aggregationLevel === 'build_id'}
        <label class="body-control-set--label">Time Horizon </label>
        <TimeHorizonControl
          horizon={timeHorizon}
          on:selection={makeSelection('timeHorizon')}
        />
      {/if}
    </div>

    <CategoricalMenu
      data={selectedData}
      {activeBuckets}
      {bucketColorMap}
      {bucketOptions}
    />
  </div>

  <div class="body-control-row  body-control-row--stretch">
    <div class="body-control-set">
      <label class="body-control-set--label">Metric Type</label>
      <ProportionMetricTypeControl
        {metricType}
        on:selection={makeSelection('metricType')}
      />
    </div>
  </div>

  <div class="data-graphics">
    {#each aggregationTypes as aggType, i (aggType + timeHorizon + probeType + metricType)}
      {#if aggregationTypes.length === 1 || aggType === currentAggregation}
        <div class="small-multiple">
          <ProbeExplorer
            bind:ref
            aggregationsOverTimeTitle={overTimeTitle(
              metricType,
              aggregationLevel
            )}
            aggregationsOverTimeDescription={proportionsOverTimeDescription(
              metricType,
              aggregationLevel
            )}
            summaryLabel="cat."
            normalizedData={selectedData}
            activeBins={activeBuckets}
            {timeHorizon}
            binColorMap={bucketColorMap}
            showViolins={false}
            {aggregationLevel}
            pointMetricType={getProportionName(
              $store.productDimensions.normalizationType
            )}
            {densityMetricType}
            yTickFormatter={metricType === 'proportions'
              ? formatPercent
              : formatCount}
            summaryNumberFormatter={metricType === 'proportions'
              ? formatPercentDecimal
              : formatCount}
            yScaleType={'linear'}
            yDomain={[
              0,
              Math.max(
                ...selectedData
                  .map((d) =>
                    Object.values(
                      d[
                        metricType === 'proportions'
                          ? getProportionName(
                              $store.productDimensions.normalizationType
                            )
                          : getCountName(
                              $store.productDimensions.normalizationType
                            )
                      ]
                    )
                  )
                  .flat()
              ),
            ]}
          />
        </div>
      {/if}
    {/each}
  </div>
</div>
