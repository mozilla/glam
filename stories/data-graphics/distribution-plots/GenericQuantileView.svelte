<script>
import QuantileExplorerView from '../../../src/app/patterns/body/quantiles/QuantileExplorerView.svelte';
import NAV_URL from '../../../tests/data/browser_engagement_navigation_urlbar_build_id.json';
import ACTIVE_TICKS from '../../../tests/data/browser_engagement_active_ticks_build_id.json';
import GCMS from '../../../tests/data/gc_ms_build_id.json';

import { responseToData } from '../../../src/app/state/store';

import { firefoxVersionMarkers } from '../../../src/app/state/product-versions';

let which = 0;
let probes = [

  {
    name: 'browser_engagement_active_ticks',
    data: responseToData(ACTIVE_TICKS.response),
    probeType: 'scalar',
  }, {
    name: 'gc_ms',
    data: responseToData(GCMS.response),
    probeType: 'histogram',
  },

  {
    name: 'browser_engagement_navigation_urlbar',
    data: responseToData(NAV_URL.response),
    probeType: 'scalar',
  },
];

let timeHorizon = 'ALL_TIME';
let percentiles = [95, 75, 50, 25, 5];

function handleSelection(event) {
  const { selection, type } = event.detail;
  if (type === 'timeHorizon') timeHorizon = selection;
  if (type === 'percentiles') percentiles = selection;
}

</script>


<style>

.story {
  position: relative;
}

.explorer-view {
  margin: auto;
}

.view-header {
  display: grid;
  grid-template-columns: auto max-content;
  font-family: var(--main-mono-font);
  border-bottom: 3px solid var(--cool-gray-200);
  margin-bottom: var(--space-4x);
}

.view-header h1 {
  font-weight: normal;
  margin:0px;
}

.selectors {
  position: relative;
  width: max-content;
  font-size: var(--text-02);
  font-family: var(--main-mono-font);
  margin-bottom: var(--space-4x);
  padding: var(--space-4x);
  border-radius: var(--space-base);
  box-shadow: var(--depth-tiny);
  z-index:1000;
  background-color: white;
  color: var(--blue-slate-600);
}

.selectors i {
  font-weight: 100;
  color: var(--cool-gray-500);
}

</style>


<div class=story>
  <div style="width: 900px;" class='explorer-view'>
      <div class='view-header'>
          <h1>Quantile Explorer</h1>
          <div class='selectors'>
            {#each probes as {name, data}, i}
              <label>
                <input type=radio bind:group={which} value={i}>
                {name}
              </label>
            {/each}
            </div>
      </div>

    <h1 class="story__title">probe / <span class=probe-head>{probes[which].name}</span></h1>
    {#each probes as probe, i (probe.name)}
      {#if which === i}
        <QuantileExplorerView 
          probeType={probe.probeType}
          data={probe.data}
          timeHorizon={timeHorizon}
          percentiles={percentiles}
          markers={$firefoxVersionMarkers}
          on:selection={handleSelection}
        />
      {/if}
    {/each}
  </div>
</div>