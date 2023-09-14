<script>
  import _ from 'lodash';
  import Modal from './Modal.svelte';
  import DistributionComparisonGraph from './explore/DistributionComparisonGraph.svelte';
  import DistributionChart from './explore/DistributionChart.svelte';
  export let densityMetricType;
  export let topChartData;
  export let bottomChartData;
  export let distViewButtonId;

  let valueSelector = 'value';
  // Change this value to adjust the minimum tick increment on the chart
  export let tickIncrement = 2;
  const getTopTick = function(rd, ld) {
    let maxRd = rd ? Math.max(...rd.map((di) => di[valueSelector])) : 0
    let maxLd = ld ? Math.max(...ld.map((di) => di[valueSelector])) : 0
    let maxValue = Math.max(maxLd, maxRd)
    let maxValPercent = Math.round(maxValue*100)
    let topTick = (maxValPercent + (tickIncrement - maxValPercent%tickIncrement))/100
    return topTick
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
    min-height: 50vh;
    margin-left:auto;
    margin-right:auto;
    height:auto;
    flex-direction: row;
    flex: 1;
  }
  .chart-fixed {
    clear:both;
    padding: 0.7%;
    min-width: fit-content;
  }
  .chart-fixed > p {
    font-size: small;
  }
  .percentiles {
    display: flex;
    flex-grow: 1;
    align-items: center;
    padding: 2%;
  }
</style>
{#if (topChartData && bottomChartData)}
  {@const topTick = getTopTick(bottomChartData[densityMetricType], topChartData[densityMetricType])}
  {@const topChartDensity = topChartData[densityMetricType]}
  {@const topChartSampleCount = topChartData.sample_count}
  {@const bottomChartDensity = bottomChartData[densityMetricType]}
  {@const bottomChartSampleCount = bottomChartData.sample_count}
  <Modal>
    <div slot="trigger" let:open>
      <button on:click={open} id={distViewButtonId} hidden>Distribution comparison</button>
    </div>
    <div slot="title">Distribution comparison</div>
    <div class="outer-flex">
      <div class="charts">
        <div class="chart-fixed">
          <p>Reference</p>
          <DistributionComparisonGraph
            density={topChartDensity}
            topTick={topTick}
            {tickIncrement}>
            <g
              slot="glam-body">
              {#if bottomChartData}
                <DistributionChart
                  density={topChartDensity}
                  topTick={topTick}
                  {tickIncrement}
                  sampleCount={topChartSampleCount}
                  tooltipLocation="bottom"/>
              {/if}
            </g>
          </DistributionComparisonGraph>
        </div>
        <div class="chart-fixed">
          <p>Hovered</p>
          <DistributionComparisonGraph
            density={bottomChartDensity}
            topTick={topTick}
            {tickIncrement}>
            <g
              slot="glam-body">
              {#if bottomChartData}
                <DistributionChart
                  density={bottomChartDensity}
                  {topTick}
                  sampleCount={bottomChartSampleCount}
                  tooltipLocation="top"/>
              {/if}
            </g>
          </DistributionComparisonGraph>
        </div>
      </div>
      <div class="percentiles">
        <slot name="comparisonSummary"/>
      </div>
    </div>

  </Modal>
{/if}
