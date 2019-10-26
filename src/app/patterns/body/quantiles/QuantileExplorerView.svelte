<script>
import { setContext } from 'svelte';
import QuantileExplorerSmallMultiple from './QuantileExplorerSmallMultiple.svelte';
import PercentileSelectionControl from '../../PercentileSelectionControl.svelte';
import TimeHorizonControl from '../../TimeHorizonControl.svelte';

import {
  gatherBy, makeDataset, topKBuildsPerDay, sortByKey,
} from '../../../utils/probe-utils';


export let data;
export let probeType;

function byKeyAndAggregation(d) {
  const byKey = gatherBy(data, (entry) => entry.key);
  Object.keys(byKey).forEach((k) => {
    byKey[k] = gatherBy(byKey[k], (entry) => entry.client_agg_type);
    Object.keys(byKey[k]).forEach((aggKey) => {
      byKey[k][aggKey] = makeDataset(byKey[k][aggKey], 'build_id');
      byKey[k][aggKey] = topKBuildsPerDay(byKey[k][aggKey], 2);
      byKey[k][aggKey].sort(sortByKey('label'));
    });
  });
  return byKey;
}

const transformed = byKeyAndAggregation(data);

let timeHorizon = 'MONTH';
let percentiles = [5, 25, 50, 75, 95];

setContext('probeType', probeType);

</script>
    
    <style>
      .body-content {
        margin-top: var(--space-2x);
      }
  
      .data-graphics {
        margin-top: var(--space-4x);
      }
  
    </style>
    
    
    <div class=body-content>
      
      <div class=body-control-row>
        <div class=body-control-set>
          <label class=body-control-set--label>Time Horizon  </label>
          <TimeHorizonControl bind:horizon={timeHorizon} />
        </div>
      
        <div class=body-control-set>
            <label class=body-control-set--label>Probe Value Percentiles</label>
          <PercentileSelectionControl bind:percentiles={percentiles} />
        </div>
      </div>
  
      <div class=data-graphics>
        {#each Object.entries(transformed) as [key, aggs], i (key)}
          {#if key !== 'undefined'}
            <h4>{key}</h4>
          {/if}
          {probeType}

          {#each Object.entries(aggs) as [aggType, data], i (aggType + timeHorizon)}
            <div>
              <QuantileExplorerSmallMultiple
                title={aggType}
                data={data}
                probeType={probeType}
                percentiles={percentiles}
                timeHorizon={timeHorizon}
              />
            </div>
          {/each}
        {/each}
        <!-- {#each aggs as [aggType, dataset], i (aggType + timeHorizon)}
          <div>
            <NumericHistogramSmallMultiple
              title={[aggType]}
              data={dataset}
              key={aggType + timeHorizon}
              resolution={timeHorizon}
              percentiles={percentiles}
            />
        </div>
        {/each} -->
      </div>
    </div>
    