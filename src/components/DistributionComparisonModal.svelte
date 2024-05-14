<script>
  import SliderSwitch from './controls/SliderSwitch.svelte';
  import Modal from './Modal.svelte';
  import DistributionComparisonGraph from './explore/DistributionComparisonGraph.svelte';
  import DistributionChart from './explore/DistributionChart.svelte';
  import { store } from '../state/store';
  import routes from '../config/routes';
  import { convertValueToPercentage } from '../utils/probe-utils';

  export let densityMetricType;
  export let topChartData;
  export let bottomChartData;
  export let distViewButtonId;

  let normalized = $store.productDimensions.normalizationType === 'normalized';
  let probeType = $store.probe.type;
  let isCategoricalProbe = $store.probe.details && $store.probe.details.kind === 'categorical';
  let cumulative = false;
  let activeCategoricalProbeLabels =
    isCategoricalProbe
      ? $store.probe.details.labels.filter((l) =>
          $store.activeBuckets.includes(l)
        )
      : [];

  let valueSelector = 'value';
  // Change this value to adjust the minimum tick increment on the chart
  export let tickIncrement = 2;

  // eslint-disable-next-line prefer-destructuring
  let innerHeight = window.innerHeight;
  // eslint-disable-next-line prefer-destructuring
  let innerWidth = window.innerWidth;
  const getTopTick = function (rd, ld) {
    let maxRd = rd ? Math.max(...rd.map((di) => di[valueSelector])) : 0;
    let maxLd = ld ? Math.max(...ld.map((di) => di[valueSelector])) : 0;
    let maxValue = Math.max(maxLd, maxRd);
    let maxValPercent = Math.round(maxValue * 100);
    let topTick =
      (maxValPercent + (tickIncrement - (maxValPercent % tickIncrement))) / 100;
    return Math.min(topTick, 1);
  };

  const roundVal = function (val) {
    return Math.round(val * 10000) / 10000;
  };

  const makeCumulative = function (density) {
    let values = density.map((d) => d[valueSelector]);
    let cumulVals = [];
    values.reduce((acc, curr) => {
      let sum = Math.min(roundVal(acc + curr), 1);
      cumulVals.push(sum);
      return sum;
    }, 0);
    return cumulVals.map((val, idx) => ({ bin: density[idx].bin, value: val }));
  };

  const buildDensity = function (chartData) {
    let density = chartData[densityMetricType];
    if (isCategoricalProbe) {
      let categoricalProbeLabels = $store.probe.details.labels;
      density = density.filter((v, i) =>
        $store.activeBuckets.includes(categoricalProbeLabels[i])
      );
    }
    if (probeType === 'scalar' || !normalized) {
      density = convertValueToPercentage(chartData[densityMetricType]);
    }
    return cumulative ? makeCumulative(density) : density;
  };
</script>

<style>
  .charts {
    display: flex;
    flex-direction: column;
  }
  .outer-flex {
    position: relative;
    display: flex;
    min-width: 97vw;
    min-height: 10vh;
    max-height: 75vh;
    margin-left: auto;
    margin-right: auto;
    height: auto;
    flex-direction: row;
    flex: 1;
  }
  .chart-fixed {
    clear: both;
    padding: 0.7%;
    min-width: fit-content;
  }
  .chart-fixed > p {
    font-size: small;
  }
  .percentiles {
    display: flex;
    flex-grow: 1;
    padding: 2%;
    flex-direction: column;
  }

  .dist-modal-details {
    height: 100%;
  }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

{#if topChartData && bottomChartData}
  {@const topChartDensity = buildDensity(topChartData)}
  {@const topChartSampleCount = topChartData.sample_count}
  {@const bottomChartDensity = buildDensity(bottomChartData)}
  {@const bottomChartSampleCount = bottomChartData.sample_count}
  {@const topTick = getTopTick(bottomChartDensity, topChartDensity)}
  <Modal>
    <div slot="trigger" let:open>
      <button on:click={open} id={distViewButtonId} hidden
        >Distribution comparison</button
      >
    </div>
    <div slot="title">Distribution comparison - {$store.probe.name}</div>
    <div class="outer-flex">
      <div class="charts">
        <div style="display: flex; padding: 1em;">
          {#if isCategoricalProbe}
            <SliderSwitch
              bind:checked={cumulative}
              label="Cumulative mode: "
              design="slider"
            />
          {/if}
        </div>
        <div class="chart-fixed">
          <p>Reference</p>
          {#key cumulative}
            {#key innerHeight}
              {#key innerWidth}
                <DistributionComparisonGraph
                  {innerHeight}
                  {innerWidth}
                  density={topChartDensity}
                  {topTick}
                  {tickIncrement}
                  {activeCategoricalProbeLabels}
                >
                  <g slot="glam-body">
                    {#if bottomChartData}
                      <DistributionChart
                        {innerHeight}
                        {innerWidth}
                        density={topChartDensity}
                        {topTick}
                        {tickIncrement}
                        sampleCount={topChartSampleCount}
                        tooltipLocation="bottom"
                        {activeCategoricalProbeLabels}
                      />
                    {/if}
                  </g>
                </DistributionComparisonGraph>
              {/key}
            {/key}
          {/key}
        </div>
        <div class="chart-fixed">
          <p>Hovered</p>
          {#key cumulative}
            {#key innerHeight}
              {#key innerWidth}
                <DistributionComparisonGraph
                  {innerHeight}
                  {innerWidth}
                  density={bottomChartDensity}
                  {topTick}
                  {tickIncrement}
                  {activeCategoricalProbeLabels}
                >
                  <g slot="glam-body">
                    {#if bottomChartData}
                      <DistributionChart
                        {innerHeight}
                        {innerWidth}
                        density={bottomChartDensity}
                        {topTick}
                        sampleCount={bottomChartSampleCount}
                        tooltipLocation="top"
                        {activeCategoricalProbeLabels}
                      />
                    {/if}
                  </g>
                </DistributionComparisonGraph>
              {/key}
            {/key}
          {/key}
        </div>
      </div>
      <div class="percentiles">
        <div class="drawer graphic-body__details">
          <div class="drawer-section-container dist-modal-details">
            <h3 style="align-self: center;">{$store.probe.name}</h3>
            <svelte:component
              this={routes[$store.product].details}
              showLinks={false}
            />
          </div>
        </div>
        <div><hr /></div>
        <slot name="comparisonSummary" />
      </div>
    </div>
  </Modal>
{/if}
