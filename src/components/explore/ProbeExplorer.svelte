<script>
  import { writable } from 'svelte/store';

  import { window1D } from '@graph-paper/core/utils/window-functions';
  import ToplineMetrics from './ToplineMetrics.svelte';

  import AggregationsOverTimeGraph from './AggregationsOverTimeGraph.svelte';
  import AggregationComparisonGraph from './AggregationComparisonGraph.svelte';

  import ClientVolumeOverTimeGraph from './ClientVolumeOverTimeGraph.svelte';
  import CompareClientVolumeGraph from './CompareClientVolumeGraph.svelte';

  import ComparisonSummary from './ComparisonSummary.svelte';

  import AdHocViolin from './AdHocViolin.svelte';

  import { store } from '../../state/store';

  import {
    explorerComparisonSmallMultiple,
    overTimeTitle,
    clientVolumeOverTimeDescription as clientDescription,
    compareDescription,
  } from '../../utils/constants';

  import {
    formatBuildIDToDateString,
    formatCount,
    formatFromNanoseconds,
    formatMemory,
  } from '../../utils/formatters';

  import { clientCounts } from '../../utils/probe-utils';

  import { histogramSpring } from '../../utils/animation';

  export let data;
  export let key;
  export let timeHorizon;
  export let aggregationLevel;
  export let activeBins = [50];
  export let showViolins = true;
  export let binColorMap;
  export let pointMetricType;
  export let overTimePointMetricType = pointMetricType;
  export let yScaleType;
  export let yDomain;
  export let densityMetricType;
  export let yTickFormatter = formatCount;
  if (data[0].metric_type === 'timing_distribution') {
    yTickFormatter = formatFromNanoseconds;
  } else if (data[0].metric_type === 'memory_distribution') {
    yTickFormatter = formatMemory($store.probe.info.memory_unit);
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
  export let clientVolumeOverTimeDescription = clientDescription(
    aggregationLevel
  );

  // If there isn't more than one other point to compare,
  // let's turn off the hover.
  let hoverActive = data.length > 2;
  $: hoverActive = data.length > 2;

  // If insufficient data, suppress the main graph
  // and blow up the other.
  let insufficientData = data.length <= 2;
  $: insufficientData = data.length <= 2;
  $: justOne = data.length === 1;

  let domain = writable([]);
  const horizonToDays = {
    WEEK: 7,
    MONTH: 30,
    QUARTER: 90,
  };

  function setDomain(str) {
    if (aggregationLevel === 'build_id') {
      const start =
        str === 'ALL'
          ? new Date(+data[0].label)
          : new Date(+data[data.length - 1].label);
      if (str !== 'ALL') {
        start.setDate(start.getDate() - horizonToDays[str]);
      }
      const end = new Date(+data[data.length - 1].label);
      domain.set([start, end]);
    } else if (aggregationLevel === 'version') {
      domain.set(data.map((d) => d.label));
    }
  }

  // Trigger `setDomain` to run any time this changes.
  $: if (aggregationLevel) {
    setDomain(timeHorizon);
  }

  export let hovered = !hoverActive ? { x: data[0].label, datum: data[0] } : {};

  function leftLabelForAggComparison(d, aggLevel, x) {
    if (d.length === 2) {
      if (aggLevel === 'build_id') return formatBuildIDToDateString(d[0].label);
      return d[0].label;
    }
    if (aggLevel === 'build_id') return formatBuildIDToDateString(x);
    return x;
  }

  function leftPointsForAggComparison(d, pmt, dt) {
    if (d.length === 2) return d[0][pmt];
    if (d.length > 2 && dt) return dt[pmt];
    return undefined;
  }

  // Get the reference point from the query string if possible
  function getDefaultReferencePoint() {
    if ($store.reference) {
      const found = data.find((d) => d[aggregationLevel] === $store.reference);
      if (found) return found;
    }
    return data[data.length - 1];
  }

  export let reference = getDefaultReferencePoint();

  // Persist the reference point to the query string
  $: store.setField(
    'reference',
    aggregationLevel === 'version' ? reference.version : reference.build_id
  );

  // This will lightly animate the reference distribution part of the violin plot.
  // FIXME: for quantile plots, let's move this up a level to the view.
  // This is pretty inelegant.
  let animatedReferenceDistribution = writable(0);
  $: if (densityMetricType) {
    animatedReferenceDistribution = histogramSpring(
      reference[densityMetricType]
    );
  }
  $: if (densityMetricType && reference[densityMetricType]) {
    animatedReferenceDistribution.setValue(reference[densityMetricType]);
  }

  // client counts.
  const MULT = 1.1;
  $: clientCountsData = clientCounts(data);
  $: yVals = clientCountsData.map((d) => d.totalClients);
  $: yMax = Math.max(50, Math.max(...yVals));
  $: yClientsDomain = [0, yMax * MULT];

  // setting hovered value.
  function get(d, x) {
    return window1D({
      data: d,
      value: x,
      lowestValue: $domain[0],
      highestValue: $domain[1],
    });
  }
  let hoverValue = {};
  $: if (hoverValue.x) {
    const i = get(data, hoverValue.x);
    hovered = {
      ...hoverValue,
      datum: data[i.currentIndex],
      previous: data[i.previousIndex],
      next: data[i.nextIndex],
    };
  } else {
    hovered = {};
  }
</script>

<style>
  .graphic-and-summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content auto;
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
</style>

<div class="probe-body-overview">
  <ToplineMetrics
    {reference}
    hovered={data.length > 2 ? hovered.datum : data[0]}
    dataLength={data.length}
    {aggregationLevel} />
  <slot name="summary" />
</div>

<div class="graphic-and-summary" class:no-line-chart={insufficientData}>
  <div style="display: {insufficientData ? 'none' : 'block'}">
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
      {reference}
      {hovered}
      bind:hoverValue
      {aggregationLevel}
      {insufficientData}
      on:click={() => {
        if (hovered.datum) {
          reference = hovered.datum;
        }
      }}>
      <slot name="additional-plot-elements" />
    </AggregationsOverTimeGraph>
  </div>

  <AggregationComparisonGraph
    description={compareDescription(aggregationsOverTimeTitle)}
    {yScaleType}
    leftLabel={leftLabelForAggComparison(data, aggregationLevel, hovered.x)}
    rightLabel={aggregationLevel === 'build_id' ? formatBuildIDToDateString(reference.label) : reference.label}
    colorMap={binColorMap}
    {yTickFormatter}
    leftPoints={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
    rightPoints={reference[pointMetricType]}
    {activeBins}
    {yDomain}
    dataVolume={data.length}
    showTopAxis={!justOne}>
    <g
      slot="glam-body"
      let:top
      let:bottom
      let:left={lp}
      let:right={rp}
      let:yScale>
      {#if showViolins}
        {#if hovered.datum && !justOne}
          <AdHocViolin
            start={(lp + rp) / 2 - (explorerComparisonSmallMultiple.width - explorerComparisonSmallMultiple.left - explorerComparisonSmallMultiple.right) / 2 + VIOLIN_PLOT_OFFSET}
            direction={-1}
            density={data.length < 3 || !hovered.datum ? data[0][densityMetricType] : hovered.datum[densityMetricType]}
            width={(explorerComparisonSmallMultiple.width - explorerComparisonSmallMultiple.left - explorerComparisonSmallMultiple.right) / 2 - VIOLIN_PLOT_OFFSET} />
        {/if}
        {#if reference && reference[densityMetricType]}
          <AdHocViolin
            start={justOne ? lp : (lp + rp) / 2}
            density={reference[densityMetricType]}
            width={justOne ? rp - lp - VIOLIN_PLOT_OFFSET * 2 : (explorerComparisonSmallMultiple.width - explorerComparisonSmallMultiple.left - explorerComparisonSmallMultiple.right) / 2 - VIOLIN_PLOT_OFFSET} />
        {/if}
        {#if !justOne}
          <line
            x1={(lp + rp) / 2}
            x2={(lp + rp) / 2}
            y1={top}
            y2={bottom}
            stroke="var(--digital-blue-150)" />
        {/if}
      {/if}
    </g>
  </AggregationComparisonGraph>

  <ComparisonSummary
    hovered={data.length === 2 || !!hovered.datum}
    left={leftPointsForAggComparison(data, pointMetricType, hovered.datum)}
    right={reference[pointMetricType]}
    leftLabel={data.length === 2 ? 'PREV.' : 'HOV.'}
    rightLabel={data.length <= 2 ? 'LATEST' : 'REF.'}
    binLabel={summaryLabel}
    keySet={activeBins}
    colorMap={binColorMap}
    valueFormatter={summaryNumberFormatter}
    keyFormatter={comparisonKeyFormatter}
    showLeft={data.length > 1}
    showDiff={data.length > 1} />
  <div style="display: {insufficientData ? 'none' : 'block'}">
    <ClientVolumeOverTimeGraph
      title={clientVolumeOverTimeTitle}
      description={clientVolumeOverTimeDescription}
      data={clientCountsData}
      xDomain={$domain}
      yDomain={yClientsDomain}
      {aggregationLevel}
      {hovered}
      {reference}
      bind:hoverValue
      on:click={() => {
        if (hovered.datum) {
          reference = hovered.datum;
        }
      }} />
  </div>
  <div style="display: {insufficientData ? 'none' : 'block'}">
    <CompareClientVolumeGraph
      description={compareDescription(clientVolumeOverTimeTitle)}
      yDomain={yClientsDomain}
      hoverValue={hovered.datum ? hovered.datum.audienceSize : 0}
      referenceValue={reference.audienceSize} />
  </div>
</div>
