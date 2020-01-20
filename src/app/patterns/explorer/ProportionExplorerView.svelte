<script>
import { createEventDispatcher } from 'svelte';
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';

import ProbeExplorer from './ProbeExplorer.svelte';
import KeySelectionControl from '../controls/KeySelectionControl.svelte';
import TimeHorizonControl from '../controls/TimeHorizonControl.svelte';
import ProportionMetricTypeControl from '../controls/ProportionMetricTypeControl.svelte';

import { formatPercent, formatCount } from '../utils/formatters';

export let aggregationLevel = 'build_id';
export let data;
export let probeType;
export let activeBuckets;
export let bucketColorMap;
export let bucketOptions;
export let timeHorizon = 'MONTH';
export let metricType = 'proportions';

export let bucketSortOrder = (a, b) => ((a < b) ? 1 : -1);

const dispatch = createEventDispatcher();

function makeSelection(type) {
  return function onSelection(event) {
    dispatch('selection', { selection: event.detail.selection, type });
  };
}

// set the audience size when the reference updates.
let reference;
const movingAudienceSize = tweened(0, { duration: 500, easing });
$: if (reference) movingAudienceSize.set(reference.audienceSize);

</script>

<style>

h2 {
  margin: 0;
}

.body-content {
  margin-top: var(--space-2x);
}

.data-graphics {
  margin-top: var(--space-8x);
}

.small-multiple {
  margin-bottom: var(--space-8x);
}
</style>


<div class=body-content>
  
  <slot></slot>

  <div class=body-control-row>
    <div class=body-control-set>
      {#if aggregationLevel === 'build_id'}
      <label class=body-control-set--label>Time Horizon  </label>
      <TimeHorizonControl 
        horizon={timeHorizon}
        on:selection={makeSelection('timeHorizon')}
      />
      {/if}
    </div>
  
    <div class=body-control-set>
      <label class=body-control-set--label>Categories</label>
        <KeySelectionControl 
          sortFunction={bucketSortOrder} 
          options={bucketOptions} 
          selections={activeBuckets} 
          on:selection={makeSelection('activeBuckets')}
          colorMap={bucketColorMap} />
    </div>
  </div>

  <div class=body-control-row>
    <div class=body-control-set>
      <label class=body-control-set--label>Metric Type</label>
      <ProportionMetricTypeControl 
        metricType={metricType}
        on:selection={makeSelection('metricType')}
      />
    </div>
  </div>

  <div class=data-graphics>
    {#each Object.entries(data) as [key, aggs], i (key)}  
      {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon + probeType + metricType)}
          <div class='small-multiple'>
            <ProbeExplorer
              bind:reference={reference}
              title={key === 'undefined' ? '' : key}
              data={data}
              probeType={probeType}
              activeBins={activeBuckets}
              timeHorizon={timeHorizon}
              binColorMap={bucketColorMap}
              metricType={metricType}
              showViolins={false}
              aggregationLevel={aggregationLevel}
              pointMetricType={metricType}
              yTickFormatter={metricType === 'proportions' ? formatPercent : formatCount}
              yScaleType={'linear'}
              yDomain={[0, Math.max(...data.map((d) => Object.values(d[metricType])).flat())]}
            >

              <!-- summary bignums -->
              <div class="probe-body-overview__numbers" slot="summary">
                  <div class=bignum>
                    <div class=bignum__label>⭑ Total Clients</div>
                    <div class=bignum__value>{formatCount($movingAudienceSize)}</div>
                  </div>
              </div>

            </ProbeExplorer>
          </div>
      {/each}
    {/each}
  </div>
</div>
