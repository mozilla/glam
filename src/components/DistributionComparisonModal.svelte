<script>
  import _ from 'lodash';
  import { store } from '../state/store';
  import Modal from './Modal.svelte';
  import DistributionComparisonGraph from './explore/DistributionComparisonGraph.svelte';
  import DistributionChart from './explore/DistributionChart.svelte';
  export let showViolins;
  export let densityMetricType;
  export let topChartData;
  export let bottomChartData;

  let valueSelector = 'value';
  let binSelector = 'bin';
  function getTopTick(rd, ld) {
    let maxRd = rd ? Math.max(...rd.map((di) => di[valueSelector])) : 0
    let maxLd = ld ? Math.max(...ld.map((di) => di[valueSelector])) : 0
    let maxValue = Math.max(maxLd, maxRd)
    let maxValPercent = Math.round(maxValue*100)
    let topTick = (maxValPercent + (5 - maxValPercent%5))/100
    return topTick
  }
</script>

<style>
  .outer {
    margin-left:auto;
    margin-right:auto;
    height:auto;
    width:auto;
  }
  .inner {
    clear:both;
    padding: 2%;
    min-width: fit-content;
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
      <button on:click={open} id="dist_view" hidden>Distribution view</button>
    </div>
    <div slot="title">Distribution view</div>
    <div class=outer>
      <div class="inner">

        <DistributionComparisonGraph
          density={topChartDensity}
          topTick={topTick}>
          <g
            slot="glam-body">
            {#if showViolins}
              {#if bottomChartData}
                <DistributionChart
                  density={bottomChartDensity}
                  topTick={topTick}
                  sampleCount={topChartSampleCount}
                  tooltipLocation="bottom"/>
              {/if}
            {/if}
          </g>
        </DistributionComparisonGraph>
      </div>
      {#if true}
      <div class="inner">
        <DistributionComparisonGraph
          density={topChartDensity}
          topTick={topTick}>
          <g
            slot="glam-body">
            {#if showViolins}
              {#if bottomChartData}
                <DistributionChart
                  density={bottomChartDensity}
                  {topTick}
                  sampleCount={bottomChartSampleCount}
                  tooltipLocation="top"/>
              {/if}
            {/if}
          </g>
        </DistributionComparisonGraph>
      </div>
      {/if}
    </div>
  </Modal>
{/if}
