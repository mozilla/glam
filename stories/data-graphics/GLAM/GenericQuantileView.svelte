<script>
import QuantileExplorerView from '../../../src/app/patterns/body/explorer/QuantileExplorerView.svelte';
import NAV_URL_BUILD_ID from '../../../tests/data/browser_engagement_navigation_urlbar_build_id.json';
import ACTIVE_TICKS_BUILD_ID from '../../../tests/data/browser_engagement_active_ticks_build_id.json';
import GCMS_BUILD_ID from '../../../tests/data/gc_ms_build_id.json';

import NAV_URL_VERSION from '../../../tests/data/browser_engagement_navigation_urlbar_version.json';
import ACTIVE_TICKS_VERSION from '../../../tests/data/browser_engagement_active_ticks_version.json';
import GCMS_VERSION from '../../../tests/data/gc_ms_version.json';

import { responseToData } from '../../../src/app/state/store';

import { firefoxVersionMarkers } from '../../../src/app/state/product-versions';

let which = 1;
let aggregationLevel = 'build_id';

// let's double or triple GCMS_VERSION.response
let gcmsVersionFaked = [...GCMS_VERSION.response.map((d) => {
  const di = { data: [...d.data], metadata: { ...d.metadata } };
  di.metadata.version = di.metadata.version === '70' ? '68' : '67'; // eslint-disable-line
  return di;
}), ...GCMS_VERSION.response];

let probes = [
  {
    name: 'browser_engagement_active_ticks',
    build_id: responseToData(ACTIVE_TICKS_BUILD_ID.response),
    version: responseToData(ACTIVE_TICKS_VERSION.response, 'quantile', 'scalar-uint', 'version'),
    probeType: 'scalar',
  }, {
    name: 'gc_ms (> 2 points)',
    build_id: responseToData(GCMS_BUILD_ID.response),
    version: responseToData(gcmsVersionFaked, 'quantile', 'histogram-exponential', 'version'),
    probeType: 'histogram',
  },
  {
    name: 'gc_ms (one point)',
    build_id: responseToData(GCMS_BUILD_ID.response.slice(-2, -1)),
    version: responseToData(GCMS_VERSION.response.slice(-2, -1), 'quantile', 'histogram-exponential', 'version'),
    probeType: 'histogram',
  },
  {
    name: 'browser_engagement_navigation_urlbar',
    build_id: responseToData(NAV_URL_BUILD_ID.response),
    version: responseToData(NAV_URL_VERSION.response, 'quantile', 'scalar-uint', 'version'),
    probeType: 'scalar',
  },
];

let timeHorizon = 'MONTH';
let percentiles = [95, 75, 50, 25, 5];
let aggregationOptions = [{ name: 'By Build ID', key: 'build_id' }, { name: 'By Version', key: 'version' }];

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
  grid-template-columns: auto max-content max-content;
  grid-column-gap: var(--space-2x);
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

          <div class=selectors>
            {#each aggregationOptions as {name, key}, i }
              <label>
                <input type=radio bind:group={aggregationLevel} value={key}>
                  {name}
              </label>
            {/each}
          </div>

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
    {#each probes as probe, i (probe.name + aggregationLevel)}
      {#if which === i}
        <QuantileExplorerView 
          probeType={probe.probeType}
          data={probe[aggregationLevel]}
          timeHorizon={timeHorizon}
          percentiles={percentiles}
          markers={$firefoxVersionMarkers}
          on:selection={handleSelection}
          aggregationLevel={aggregationLevel}
        />
      {/if}
    {/each}
  </div>
</div>