<script>
  import _ from 'lodash';
  import { store } from '../state/store';
  import Modal from './Modal.svelte';
  import DistributionComparisonGraph from './explore/DistributionComparisonGraph.svelte';
  import DistributionChart from './explore/DistributionChart.svelte';

  import {
    distributionComparisonGraph,
    overTimeTitle,
    compareDescription,
  } from '../utils/constants';

  import {
    formatBuildIDToDateString,
    formatMillion,
    formatFromNanoseconds,
  } from '../utils/formatters';

  export let data;
  // If insufficient data, suppress the main graph
  export let justOne;
  export let yScaleType;
  export let showViolins;
  export let binColorMap;
  export let topLabels;
  export let yTickFormatter;
  export let leftPoints;
  export let rightPoints;
  export let activeBins;
  export let yDomain;
  export let densityMetricType;
  export let ref;
  export let leftDensity;
  export let rightDensity;
  export let hovered;
  export let rightLabel;

  const VIOLIN_PLOT_OFFSET = 7; // this is for padding our ad hoc violin

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
        {topLabels}
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
                start={(lp + rp) / 2}
                density={rightDensity}
                height={distributionComparisonGraph.height}
                width={distributionComparisonGraph.width}
                direction=-1/>
            {/if}
          {/if}
        </g>
      </DistributionComparisonGraph>
    </div>
  </div>
</Modal>
