<script>
import { setContext, createEventDispatcher } from 'svelte';

import { percentileLineColorMap } from '../../utils/color-maps';
import ProbeExplorer from './ProbeExplorer.svelte';
import PercentileSelectionControl from '../controls/PercentileSelectionControl.svelte';
import TimeHorizonControl from '../controls/TimeHorizonControl.svelte';
import AggregationTypeSelector from '../controls/AggregationTypeSelector.svelte';
import ProbeKeySelector from '../controls/ProbeKeySelector.svelte';
import { firefoxVersionMarkers } from '../../state/product-versions';
import { overTimeTitle, percentilesOverTimeDescription } from '../../utils/constants';

import { gatherProbeKeys, gatherAggregationTypes } from '../../utils/probe-utils';


const dispatch = createEventDispatcher();

export let data;
export let probeType;
export let aggregationLevel = 'build_id';

let totalAggs = Object.keys(Object.values(data)[0]).length;


export let timeHorizon = 'MONTH';
export let percentiles = [95, 75, 50, 25, 5];


let aggregationTypes = gatherAggregationTypes(data);
let probeKeys = gatherProbeKeys(data);

let currentKey = probeKeys[0];
let currentAggregation = aggregationTypes.includes('summed_histogram') ? 'summed_histogram' : aggregationTypes[0];

let aggregationInfo;

setContext('probeType', probeType);

function makeSelection(type) {
  return function onSelection(event) {
    dispatch('selection', { selection: event.detail.selection, type });
  };
}

function filterQuantileData(d, agg, key) {
  return d.filter((di) => di.client_agg_type === agg && di.metric_key === key);
}

$: selectedData = filterQuantileData(data, currentAggregation, currentKey);
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

<div class=body-content>

  <slot></slot>

  <div class="body-control-row  body-control-row--stretch">
    <div class=body-control-set>
      {#if aggregationLevel === 'build_id'}
        <label class=body-control-set--label>Time Horizon</label>
        <TimeHorizonControl
        horizon={timeHorizon}
        on:selection={makeSelection('timeHorizon')}
        />
       {/if}
    </div>

    <div class=body-control-set>
        <label class=body-control-set--label>Probe Value Percentiles</label>
      <PercentileSelectionControl
        percentiles={percentiles}
        on:selection={makeSelection('percentiles')}
        />
    </div>
  </div>

  <div class=body-control-row>
    <!-- FIXME: this is a workaround because there is a summed_histogram and a summed-histogram -->
    {#if totalAggs > 1 && currentAggregation !== 'summed_histogram' && currentAggregation !== 'summed-histogram'}
    <div class=body-control-set>
      <label class=body-control-set--label>aggregation</label>
      <AggregationTypeSelector
        bind:aggregationInfo={aggregationInfo}
        bind:currentAggregation={currentAggregation}
        aggregationTypes={aggregationTypes}
        />
    </div>
    {/if}
    {#if probeKeys && probeKeys.length > 1}
    <div class=body-control-set>
      <label class=body-control-set--label>Key</label>
        <ProbeKeySelector
          options={probeKeys}
          bind:currentKey={currentKey}
        />
      </div>
    {/if}
  </div>

  <div class=data-graphics>
    {#each probeKeys as key, i (key)}
      {#each aggregationTypes as aggType, i (aggType + timeHorizon + key)}
        {#if key === currentKey && aggType === currentAggregation}
          <div class='small-multiple'>
            <ProbeExplorer
              title={key === 'undefined' ? '' : key}
              aggregationsOverTimeTitle={overTimeTitle('percentiles', aggregationLevel)}
              aggregationsOverTimeDescription={percentilesOverTimeDescription(aggregationLevel)}
              probeFamily="Percentile"
              summaryLabel='perc.'
              data={selectedData}
              probeType={probeType}
              activeBins={percentiles}
              timeHorizon={timeHorizon}
              markers={$firefoxVersionMarkers}
              showViolins={true}
              aggregationLevel={aggregationLevel}
              binColorMap={percentileLineColorMap}
              pointMetricType={probeType === 'log' ? 'transformedPercentiles' : 'percentiles'}
              overTimePointMetricType={probeType === 'log' ? 'transformedPercentiles' : 'percentiles'}
              densityMetricType={'histogram'}
              comparisonKeyFormatter={(perc) => `${perc}%`}
              yScaleType={probeType === 'log' ? 'scalePoint' : 'linear'}
              yDomain={
                probeType === 'log' ? selectedData[0].histogram.map((d) => d.bin)
                : [1, Math.max(...selectedData.map((d) => d.percentiles[95]))]}
            >

            </ProbeExplorer>
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</div>
