<script>
  import { isEmpty } from 'lodash';
  import { writable } from 'svelte/store';

  import { window1D } from '@graph-paper/core/utils/window-functions';
  import ToplineMetrics from './ToplineMetrics.svelte';
  import GlamErrorShapes from '../errors/GlamErrorShapes.svelte';

  import AggregationsOverTimeGraph from './AggregationsOverTimeGraph.svelte';
  import AggregationComparisonGraph from './AggregationComparisonGraph.svelte';

  import ClientVolumeOverTimeGraph from './ClientVolumeOverTimeGraph.svelte';
  import SampleCountOverTimeGraph from './SampleCountOverTimeGraph.svelte';

  import CompareClientVolumeGraph from './CompareClientVolumeGraph.svelte';
  import CompareSampleCountGraph from './CompareSampleCountGraph.svelte';

  import ComparisonSummary from './ComparisonSummary.svelte';

  import AdHocViolin from './AdHocViolin.svelte';

  import { showContextMenu, store } from '../../state/store';

  import {
    explorerComparisonSmallMultiple,
    overTimeTitle,
    volumeOverTimeDescription as clientDescription,
    compareDescription,
  } from '../../utils/constants';

  import {
    formatBuildIDToDateString,
    formatCompact,
    formatFromNanoseconds,
  } from '../../utils/formatters';

  import { clientCounts, sampleCounts } from '../../utils/probe-utils';

  import { histogramSpring } from '../../utils/animation';

  import DistributionComparisonModal from '../DistributionComparisonModal.svelte';

  export let normalizedData;

  export let interpolate;
  export let pointMetricType;
  export let overTimePointMetricType = pointMetricType;

  const filterData = (normData, normType) =>
    // historical context: because non-normalized data
    // is added to the etl later, there exists
    // a time period where we don't have non-normalized
    // data which caused the graph to break.
    // so, we filter out these empty data points.
    normType === 'non_normalized'
      ? normData.filter((d) => !isEmpty(d.non_norm_histogram))
      : normData;


  function getInterpPercBtnRanksForHistogram(histogram, percentiles) {
    // Compute cumulative frequencies
    var cumFreq = [];
    var totalFreq = 0;
    for (var i = 0; i < histogram.length; i++) {
      totalFreq += histogram[i].value;
      cumFreq.push({ bin: histogram[i].bin, cumFreq: totalFreq });
    }
    const normalizer = cumFreq.at(-1).cumFreq
    if (normalizer != 1) {
      cumFreq = cumFreq.map((item) => {return {bin: item.bin, cumFreq: item.cumFreq/normalizer}})
    }

    // Find the interval where each percentile falls and interpolate
    const percentileValues = {}
    for (const percentile of percentiles) {
      var targetFreq = percentile / 100;
      if (targetFreq <= cumFreq[0].cumFreq) {
        percentileValues[percentile] = cumFreq[0].bin;
      }
      if (targetFreq >= cumFreq.at(-1).cumFreq) {
        percentileValues[percentile] = cumFreq[cumFreq.length - 1].bin;
      }
      for (var i = 0; i < cumFreq.length - 1; i++) {
        if (cumFreq[i].cumFreq <= targetFreq && cumFreq[i + 1].cumFreq >= targetFreq) {
          var x0 = cumFreq[i].cumFreq;
          var x1 = cumFreq[i + 1].cumFreq;
          var y0 = cumFreq[i].bin;
          var y1 = cumFreq[i + 1].bin;
          // Linear interpolation formula
          var percentileValue = y0 + ((targetFreq - x0) * (y1 - y0)) / (x1 - x0);
          percentileValues[percentile] = percentileValue;
        }
      }
    }
    return percentileValues;
  }

  function getInterpolatedPercentilesBtnRanks(data, percentileAccessor, normalizationType) {
    // Generates percentiles using the Interpolation Between Closest Ranks method.
    const histogramAccessor = normalizationType == "normalized" ? "histogram" : "non_norm_histogram";
    const percentiles = Object.keys(data[0][percentileAccessor]);

    return data.map((item, idx) => {
      const histogram = item[histogramAccessor];
      const interpVals = histogram ? getInterpPercBtnRanksForHistogram(histogram, percentiles) : percentiles;
      const { [percentileAccessor]: _, ...rest } = item;
      return {
        ...rest,
        [percentileAccessor]: interpVals,
      };
    });
  }

  function interpolatePercentilesMovingAvg(data, accessor) {
    // Interpolates existing percentile values by applying a Moving Average.
    const windowSize = data.length / 100;
    const dataField = data[0][accessor];
    const keys = Object.keys(dataField);

    return data.map((item, idx) => {
      const windowData = data.slice(Math.max(0, idx - windowSize + 1), idx + 1);

      const interpVals = keys.reduce((acc, key) => {
        const sum = windowData.reduce(
          (total, wItem) => total + wItem[accessor][key],
          0
        );
        acc[key] = sum / windowData.length;
        return acc;
      }, {});
      const { [accessor]: _, ...rest } = item;
      return {
        ...rest,
        [accessor]: interpVals,
      };
    });
  }

  function filterAndSmoothenData(data, normalizationType) {
    const filtered = filterData(data, normalizationType);
    return interpolate ? getInterpolatedPercentilesBtnRanks(filtered, overTimePointMetricType, normalizationType) : filtered;
  }

  let data = filterAndSmoothenData(
    normalizedData,
    $store.productDimensions.normalizationType
  );
  $: data = filterAndSmoothenData(
    normalizedData,
    $store.productDimensions.normalizationType
  );
  export let key;
  export let timeHorizon;
  export let aggregationLevel;
  export let activeBins = [50];
  export let showViolins = true;
  export let binColorMap;
  export let yScaleType;
  export let yDomain;
  export let densityMetricType;
  export let yTickFormatter = formatCompact;
  if (data[0].metric_type === 'timing_distribution') {
    yTickFormatter = formatFromNanoseconds;
  }
  export let summaryNumberFormatter = yTickFormatter;
  export let comparisonKeyFormatter = (v) => v;
  export let summaryLabel = 'perc.';

  const VIOLIN_PLOT_OFFSET = 7; // this is for padding our ad hoc violin

  export let aggregationsOverTimeTitle;
  export let aggregationsOverTimeDescription;
  export let clientVolumeOverTimeTitle = overTimeTitle(
    'clientVolume',
    aggregationLevel
  );

  export let volumeOverTimeDescription = clientDescription(
    aggregationLevel,
    $store.countView
  );

  // If there isn't more than one other point to compare,
  // let's turn off the hover.
  let hoverActive = data.length > 1;
  $: hoverActive = data.length > 1;

  // If insufficient data, suppress the main graph
  $: justOne = data.length === 1;

  let domain = writable([]);
  const horizonToDays = {
    WEEK: 7,
    MONTH: 30,
    QUARTER: 90,
  };

  // Get the reference point from the query string if possible
  function getDefaultReferencePoint() {
    if ($store.ref) {
      const found = data.find((d) => d[aggregationLevel] === $store.ref);
      if (found) return found;
    }
    return data[data.length - 1];
  }

  let ref = getDefaultReferencePoint();

  function setDomain(str) {
    if (str === 'ZOOM') {
      // Try to get ref & hov from query string.
      const start = data.find(
        (d) => d.build_id === $store.hov || d.version === $store.hov
      ).label;
      const end = getDefaultReferencePoint().label;
      domain.set([new Date(+start), new Date(+end)]);
    } else if (aggregationLevel === 'build_id') {
      const start =
        str === 'ALL'
          ? new Date(+data[0].label)
          : new Date(+data[data.length - 1].label);
      if (Object.keys(horizonToDays).includes(str)) {
        start.setDate(start.getDate() - horizonToDays[str]);
      }
      const end = new Date(+data[data.length - 1].label);
      domain.set([start, end]);
    } else if (aggregationLevel === 'version') {
      domain.set(data.map((d) => d.label));
    }
  }

  // Trigger `setDomain` to run any time this changes.
  $: if (aggregationLevel || (timeHorizon && $store.hov)) {
    setDomain(timeHorizon);
  }

  export let hovered = hoverActive ? {} : { x: data[0].label, datum: data[0] };

  function leftPointsForAggComparison(d, pmt, dt) {
    if (d.length > 1 && dt) return dt[pmt];
    return undefined;
  }

  // Persist the reference point to the query string if not last data point.
  $: if (ref[aggregationLevel] !== data[data.length - 1][aggregationLevel]) {
    store.setField('ref', ref[aggregationLevel]);
  } else {
    store.setField('ref', '');
  }

  // This will lightly animate the reference distribution part of the violin plot.
  // FIXME: for quantile plots, let's move this up a level to the view.
  // This is pretty inelegant.
  let animatedReferenceDistribution = writable(0);
  $: if (densityMetricType) {
    animatedReferenceDistribution = histogramSpring(ref[densityMetricType]);
  }
  $: if (densityMetricType && ref[densityMetricType]) {
    animatedReferenceDistribution.setValue(ref[densityMetricType]);
  }

  // client counts.
  const MULT = 1.1;
  const MAX_DEFAULT_VALUE = 50;
  $: clientCountsData = clientCounts(data);
  $: sampleCountsData = sampleCounts(data);
  $: yValsSample = sampleCountsData.map((d) => d.totalSample);
  $: yVals = clientCountsData.map((d) => d.totalClients);
  $: yMaxClient = Math.max(MAX_DEFAULT_VALUE, Math.max(...yVals));
  $: yMaxSample = Math.max(MAX_DEFAULT_VALUE, Math.max(...yValsSample));

  $: yClientsDomain = [0, yMaxClient * MULT];
  $: ySamplesDomain = [0, yMaxSample * MULT];

  let hoverValue = {};
  let lastHoverValue = {};

  // setting hovered value.
  function get(d, x) {
    return window1D({
      data: d,
      value: x,
      lowestValue: $domain[0],
      highestValue: $domain[$domain.length - 1],
    });
  }

  let leftDensity;
  let rightDensity = ref[densityMetricType];
  let leftAudienceValue = hovered.datum ? hovered.datum.audienceSize : 0;
  let rightAudienceValue = ref.audienceSize;
  let leftSampleValue = hovered.datum ? hovered.datum.sample_count : 0;
  let rightSampleValue = ref.sample_count;
  let leftPoints = leftPointsForAggComparison(
    data,
    pointMetricType,
    hovered.datum
  );
  let rightPoints = ref[pointMetricType];
  let topLabels = ['HOV.', 'REF.'];
  export let distViewTopChartData;
  export let distViewBottomChartData;

  // initialize the normalization type if it doesn't exist
  $: if (!$store.productDimensions.normalizationType) {
    store.setField('productDimensions', {
      ...$store.productDimensions,
      normalizationType: 'normalized',
    });
  }

  $: if (hoverValue.x) {
    const i = get(data, hoverValue.x);
    hovered = {
      ...hoverValue,
      datum: data[i.currentIndex],
      previous: data[i.previousIndex],
      next: data[i.nextIndex],
    };
    lastHoverValue = hovered;
    if ($showContextMenu) {
      distViewTopChartData = ref;
      distViewBottomChartData = hovered.datum;
    } else {
      if (
        ($store.ref && $store.ref > hovered.datum.build_id) ||
        (!$store.ref && ref > hovered.datum.build_id)
      ) {
        topLabels = ['HOV.', 'REF.'];
        leftDensity = hovered.datum[densityMetricType];
        rightDensity = ref[densityMetricType];
        leftAudienceValue = hovered.datum.audienceSize;
        rightAudienceValue = ref.audienceSize;
        leftSampleValue = hovered.datum.sample_count;
        rightSampleValue = ref.sample_count;
        leftPoints = leftPointsForAggComparison(
          data,
          pointMetricType,
          hovered.datum
        );
        rightPoints = ref[pointMetricType];
      }
      if ($store.ref && $store.ref < hovered.datum.build_id) {
        topLabels = ['REF.', 'HOV.'];
        leftDensity = ref[densityMetricType];
        rightDensity = hovered.datum[densityMetricType];
        leftAudienceValue = ref.audienceSize;
        rightAudienceValue = hovered.datum.audienceSize;
        leftSampleValue = ref.sample_count;
        rightSampleValue = hovered.datum.sample_count;
        leftPoints = ref[pointMetricType];
        rightPoints = leftPointsForAggComparison(
          data,
          pointMetricType,
          hovered.datum
        );
      }
    }
  } else if ($showContextMenu) {
    hovered = lastHoverValue;
  }
  const distViewButtonId = 'dist_view';
</script>

<style>
  .graphic-and-summary {
    display: grid;
    grid-template-columns: calc(var(--app-width) * 0.4) min-content auto;
    grid-row-gap: var(--space-2x);
  }

  .no-line-chart {
    justify-items: start;
  }

  .probe-body-overview {
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    justify-items: start;
    margin-bottom: var(--space-4x);
  }

  .data-error-msg__bg {
    background: radial-gradient(var(--cool-gray-100), var(--cool-gray-100));
    width: 200px;
    height: 200px;
    padding: var(--space-4x);
    margin: 0 auto;
    border-radius: 50%;
    margin-top: var(--space-2x);
  }

  .detail-title {
    font-size: var(--text-015);
    font-weight: 300;
    color: var(--cool-gray-700);
    margin-right: 3em;
  }

  .dist-comp-percentile-tbl {
    flex: 1;
    align-items: center;
  }
</style>

<div class="probe-body-overview">
  <ToplineMetrics
    {ref}
    hovered={hovered.datum}
    dataLength={data.length}
    {aggregationLevel}
  />
  <slot name="summary" />
</div>
{#key distViewTopChartData}
  {#key distViewBottomChartData}
    <DistributionComparisonModal
      {densityMetricType}
      topChartData={distViewTopChartData}
      bottomChartData={distViewBottomChartData}
      {distViewButtonId}
      keySet={activeBins}
    >
      <div slot="comparisonSummary" class="dist-comp-percentile-tbl">
        <ComparisonSummary
          hovered={data.length === 1 || !!hovered.datum}
          left={leftPoints}
          right={rightPoints}
          hov={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
          ref={ref[pointMetricType]}
          leftLabel={topLabels[0]}
          rightLabel={topLabels[1]}
          binLabel={summaryLabel}
          keySet={activeBins}
          colorMap={binColorMap}
          valueFormatter={summaryNumberFormatter}
          keyFormatter={comparisonKeyFormatter}
          showLeft={data.length > 1}
          showDiff={data.length > 1}
          viewType={$store.viewType}
          {justOne}
          title="Percentiles"
        />
      </div>
    </DistributionComparisonModal>
  {/key}
{/key}

<div class="graphic-and-summary" class:no-line-chart={justOne}>
  <div>
    {#if justOne}
      <div class="data-error-msg">
        <div class="data-error-msg__bg">
          <GlamErrorShapes />
        </div>
        <div>
          <p class="detail-title">
            Currently we don't have enough data to generate an over-time graph
            for this metric. Please refer to the Table View to see the available
            data, or use the SQL query generator for <a
              href="https://docs.telemetry.mozilla.org/cookbooks/main_ping_exponential_histograms.html"
              >further STMO analysis</a
            >.
          </p>
          <p class="detail-title">
            Please reach out in the <a
              href="https://mozilla.slack.com/archives/CB1EQ437S">#glam</a
            >
            channel on Mozilla's internal Slack, or
            <a href="https://matrix.to/#/#datatools:mozilla.org">#datatools</a> on
            Mozilla's Matrix if you need more help.
          </p>
        </div>
      </div>
    {:else}
      <AggregationsOverTimeGraph
        title={aggregationsOverTimeTitle}
        description={aggregationsOverTimeDescription}
        {data}
        xDomain={$domain}
        {yDomain}
        lineColorMap={binColorMap}
        {key}
        yAccessor={overTimePointMetricType}
        xScaleType={aggregationLevel === 'version' ? 'scalePoint' : 'time'}
        {yScaleType}
        {yTickFormatter}
        metricKeys={activeBins}
        {ref}
        {hovered}
        bind:hoverValue
        {aggregationLevel}
        on:click={() => {
          if (hovered.datum) {
            ref = hovered.datum;
          }
        }}
        {distViewButtonId}
      >
        <slot name="additional-plot-elements" />
        <div slot="smoother"><slot name="smoother" /></div>
      </AggregationsOverTimeGraph>
    {/if}
  </div>

  <AggregationComparisonGraph
    description={compareDescription(aggregationsOverTimeTitle)}
    {justOne}
    {yScaleType}
    rightLabel={aggregationLevel === 'build_id'
      ? formatBuildIDToDateString(ref.label)
      : ref.label}
    colorMap={binColorMap}
    {topLabels}
    {yTickFormatter}
    {leftPoints}
    {rightPoints}
    {activeBins}
    {yDomain}
    dataVolume={data.length}
    showTopAxis={!justOne}
  >
    <g
      slot="glam-body"
      let:top
      let:bottom
      let:left={lp}
      let:right={rp}
      let:yScale
    >
      {#if showViolins}
        {#if hovered.datum && !justOne}
          <AdHocViolin
            start={(lp + rp) / 2 -
              (explorerComparisonSmallMultiple.width -
                explorerComparisonSmallMultiple.left -
                explorerComparisonSmallMultiple.right) /
                2 +
              VIOLIN_PLOT_OFFSET}
            direction={-1}
            density={data.length < 2 || !hovered.datum
              ? data[0][densityMetricType]
              : leftDensity}
            width={(explorerComparisonSmallMultiple.width -
              explorerComparisonSmallMultiple.left -
              explorerComparisonSmallMultiple.right) /
              2 -
              VIOLIN_PLOT_OFFSET}
          />
        {/if}
        {#if ref && ref[densityMetricType]}
          <AdHocViolin
            start={justOne ? lp : (lp + rp) / 2}
            density={rightDensity}
            width={justOne
              ? rp - lp - VIOLIN_PLOT_OFFSET * 2
              : (explorerComparisonSmallMultiple.width -
                  explorerComparisonSmallMultiple.left -
                  explorerComparisonSmallMultiple.right) /
                  2 -
                VIOLIN_PLOT_OFFSET}
          />
        {/if}
        {#if !justOne}
          <line
            x1={(lp + rp) / 2}
            x2={(lp + rp) / 2}
            y1={top}
            y2={bottom}
            stroke="var(--digital-blue-150)"
          />
        {/if}
      {/if}
    </g>
  </AggregationComparisonGraph>

  <ComparisonSummary
    hovered={data.length === 1 || !!hovered.datum}
    left={leftPoints}
    right={rightPoints}
    hov={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
    ref={ref[pointMetricType]}
    leftLabel={topLabels[0]}
    rightLabel={topLabels[1]}
    binLabel={summaryLabel}
    keySet={activeBins}
    colorMap={binColorMap}
    valueFormatter={summaryNumberFormatter}
    keyFormatter={comparisonKeyFormatter}
    showLeft={data.length > 1}
    showDiff={data.length > 1}
    viewType={$store.viewType}
    {justOne}
  />
  {#if $store.productDimensions.normalizationType === 'normalized'}
    <div style="display: {justOne ? 'none' : 'block'}">
      <ClientVolumeOverTimeGraph
        title={clientVolumeOverTimeTitle}
        description={clientDescription(aggregationLevel, $store.countView)}
        data={clientCountsData}
        xDomain={$domain}
        yDomain={yClientsDomain}
        {aggregationLevel}
        {hovered}
        {ref}
        bind:hoverValue
        on:click={() => {
          if (hovered.datum) {
            ref = hovered.datum;
          }
        }}
      />
    </div>
    <div style="display: {justOne ? 'none' : 'block'}">
      <CompareClientVolumeGraph
        description={compareDescription(clientVolumeOverTimeTitle)}
        yDomain={yClientsDomain}
        {leftAudienceValue}
        {rightAudienceValue}
      />
    </div>
  {/if}
  {#if $store.productDimensions.normalizationType === 'non_normalized'}
    <SampleCountOverTimeGraph
      title={overTimeTitle('sampleVolume', aggregationLevel)}
      description={clientDescription(aggregationLevel, $store.countView)}
      data={sampleCountsData}
      xDomain={$domain}
      yDomain={ySamplesDomain}
      {aggregationLevel}
      {hovered}
      {ref}
      bind:hoverValue
      on:click={() => {
        if (hovered.datum) {
          ref = hovered.datum;
        }
      }}
    />
    <div style="display: {justOne ? 'none' : 'block'}">
      <CompareSampleCountGraph
        description={compareDescription(
          overTimeTitle('sampleVolume', aggregationLevel)
        )}
        yDomain={ySamplesDomain}
        {leftSampleValue}
        {rightSampleValue}
      />
    </div>
  {/if}
</div>
