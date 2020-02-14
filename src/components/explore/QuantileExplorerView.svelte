<script>
import { setContext, getContext, createEventDispatcher } from 'svelte';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
// import { interpolateBlues as colorMap } from 'd3-scale-chromatic';

import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';
import { percentileLineColorMap } from 'udgl/data-graphics/utils/color-maps';
import ProbeExplorer from './ProbeExplorer.svelte';
import PercentileSelectionControl from '../controls/PercentileSelectionControl.svelte';
import TimeHorizonControl from '../controls/TimeHorizonControl.svelte';
import AggregationTypeSelector from '../controls/AggregationTypeSelector.svelte';
import ProbeKeySelector from '../controls/ProbeKeySelector.svelte';


import { formatCount, formatValue } from '../../utils/formatters';

const dispatch = createEventDispatcher();

export let store = getContext('store');
export let actions = getContext('actions');

export let data;
export let probeType;
export let markers;
export let aggregationLevel = 'build_id';

let totalAggs = Object.keys(Object.values(data)[0]).length;


export let timeHorizon = 'MONTH';
export let percentiles = [95, 75, 50, 25, 5];


function gatherProbeKeys(nestedData) {
  return Object.keys(nestedData);
}

function gatherAggregationTypes(nestedData) {
  return Object.keys(Object.values(nestedData)[0]);
}


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

// we are going to use this for the summary display
let reference;
let hovered;

const movingAudienceSize = tweened(0, { duration: 500, easing });

const refMedian = tweened(0, { duration: 500, easing });
$: if (reference) movingAudienceSize.set(reference.audienceSize);
$: if (reference) refMedian.set(reference.percentiles[50]);

$: if (currentKey && reference) {
  const ref = data[currentKey][currentAggregation].find((d) => d.label.toString() === reference.label.toString());
  reference = ref;
}

// for heatmap
function xyheat(d, x = 'label', y = 'bin', heat = 'value') {
  return d.map((di) => {
    const label = di[x];
    // this needs to return an array of values
    return di.histogram.map((dii) => {
      let out = {};
      out[x] = label;
      out[y] = dii[y];
      out[heat] = dii[heat];
      return out;
    });
  }).flat();
}

</script>

<style>
  .body-content {
    margin-top: var(--space-2x);
  }

  .data-graphics {
    margin-top: var(--space-6x);
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
    {#each Object.entries(data) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon + key)}
        {#if key === currentKey && (Object.entries(aggs).length === 1 || aggType === currentAggregation)}
          <div class='small-multiple'>
            <ProbeExplorer
              bind:reference={reference}
              bind:hovered={hovered}

              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              activeBins={percentiles}
              timeHorizon={timeHorizon}
              markers={markers}
              showViolins={true}
              aggregationLevel={aggregationLevel}

              binColorMap={percentileLineColorMap}
              pointMetricType={'percentiles'}
              overTimePointMetricType={probeType === 'histogram' ? 'transformedPercentiles' : 'percentiles'}
              densityMetricType={'histogram'}
              comparisonKeyFormatter={(perc) => `${perc}%`}
              yScaleType={probeType === 'histogram' ? 'scalePoint' : 'log'}
              
              yDomain={
                probeType === 'histogram' ? data[0].histogram.map((d) => d.bin)
                : [0, Math.max(...data.map((d) => d.percentiles[95]))]}
            >

                <div class='probe-body-overview__numbers' slot='summary'>
                  <div class=bignum>
                    <div class=bignum__label>⭑ Ref. Median (50th perc.)</div>
                    <div class=bignum__value>{formatValue($refMedian)}</div>
                  </div>
                  <div class=bignum>
                    <div class=bignum__label>⭑ Total Clients</div>
                    <div class=bignum__value>
                        {formatValue($movingAudienceSize)}
                    </div>
                  </div>
                </div>
                
            </ProbeExplorer>
          </div>
        {/if}
      {/each}
    {/each}
  </div>
</div>
