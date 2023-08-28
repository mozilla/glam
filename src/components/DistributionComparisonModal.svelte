<script>
  import _ from 'lodash';
  import { store } from '../state/store';
  import Modal from './Modal.svelte';
  import DistributionComparisonGraph from './explore/DistributionComparisonGraph.svelte';
  import DistributionChart from './explore/DistributionChart.svelte';

  import {
    distributionComparisonGraph
  } from '../utils/constants';


  export let data;
  // If insufficient data, suppress the main graph
  export let justOne;
  export let yScaleType;
  export let showViolins;
  export let binColorMap;
  export let yTickFormatter;
  export let leftPoints;
  export let rightPoints;
  export let activeBins;
  export let yDomain;
  export let densityMetricType;
  export let ref;
  export let rightDensity;
  export let rightLabel;

  let bins = rightDensity.map((d) => d['bin'])
</script>

<style>
  button.option-button {
    text-transform: uppercase;
    display: block;
    cursor: pointer;
    text-decoration: none;
    color: var(--digital-blue-500);
    font-size: var(--text-02);
    border: none;
    background-color: transparent;
    padding: 0%;
    margin: 0%;
  }
  .outer {
    margin-left:auto;
    margin-right:auto;
    height:auto;
    width:auto;
  }
  .inner {
    clear:both;
    padding: 3%;
  }
</style>

<Modal>
  <div slot="trigger" let:open>
    <button on:click={open} class="option-button">Distribution view</button>
  </div>
  <div slot="title">Distribution view</div>
  <div class=outer>
    <div class="inner">
      <DistributionComparisonGraph
        description={"compareDescription(aggregationsOverTimeTitle)"}
        {justOne}
        {yScaleType}
        {rightLabel}
        colorMap={binColorMap}
        {bins}
        {yTickFormatter}
        {leftPoints}
        {rightPoints}
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
            {#if ref && ref[densityMetricType]}
              <DistributionChart
                offsetX={7}
                offsetY={-20}
                density={rightDensity}
                height={distributionComparisonGraph.height}
                width={distributionComparisonGraph.width}
                direction=-1/>
            {/if}
          {/if}
        </g>
      </DistributionComparisonGraph>
    </div>
    <div class="inner">
      <DistributionComparisonGraph
        description={"compareDescription(aggregationsOverTimeTitle)"}
        {justOne}
        {yScaleType}
        {rightLabel}
        colorMap={binColorMap}
        {bins}
        {yTickFormatter}
        {leftPoints}
        {rightPoints}
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
            {#if ref && ref[densityMetricType]}
              <DistributionChart
                offsetX={7}
                offsetY={-20}
                density={rightDensity}
                height={distributionComparisonGraph.height}
                width={distributionComparisonGraph.width }
                direction=-1/>
            {/if}
          {/if}
        </g>
      </DistributionComparisonGraph>
    </div>
  </div>
</Modal>
