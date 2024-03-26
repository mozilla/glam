<script>
  import { Button, ButtonGroup } from '@graph-paper/button';
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
  let cumulative = false;

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

  const makeCumulative = function(density) {
    let values = density.map((d) => d[valueSelector])
    let cumulative = []
    values.reduce((prev, curr, i) => cumulative[i] = Math.min(prev + curr, 1), values[0])
    let cumulDensity = []
    cumulative.map((val, idx) => cumulDensity[idx] = {"bin": density[idx]["bin"], "value": val})
    return cumulDensity
  }

  const buildDensity = function(chartData) {
    let density = normalized ? chartData[densityMetricType] : convertValueToPercentage(chartData[densityMetricType])
    return cumulative ? makeCumulative(density) : density
  }
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
          <ButtonGroup>
            <Button
              tooltip="Toggle Cumulative"
              on:click={() => {
                cumulative = !cumulative;
              }}
              label="Toggle Cumulative"
              toggled={cumulative}
              level="medium"
              compact
            />
          </ButtonGroup>
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
