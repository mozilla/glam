<script>
import QuantileExplorerView from '../../../src/components/explore/QuantileExplorerView.svelte';
import BROWSER_STARTUP_BUILD_ID from './browser_startup_average_time_build_id.json';
import BROWSER_STARTUP_VERSION from './browser_startup_average_time_version.json';
import CONTENT_FRAME_TIME_BUILD_ID from './content_frame_time_build_id.json';
import CONTENT_FRAME_TIME_VERSION from './content_frame_time_version.json';

import { transformGLAMAPIResponse } from '../../../src/utils/probe-utils';

import { firefoxVersionMarkers } from '../../../src/state/product-versions';

let which = 0;
let aggregationLevel = 'build_id';

let ctf_buildID01 = transformGLAMAPIResponse(CONTENT_FRAME_TIME_BUILD_ID.response.map(di=> ({...di})).slice(-1), 'quantile', 'build_id')
let ctf_version01 = transformGLAMAPIResponse(CONTENT_FRAME_TIME_VERSION.response.map(di=> ({...di})).slice(-1), 'quantile', 'version')

let ctf_buildID02 = transformGLAMAPIResponse(CONTENT_FRAME_TIME_BUILD_ID.response.map(di=> ({...di})).slice(-2), 'quantile', 'build_id')
let ctf_version02 = transformGLAMAPIResponse(CONTENT_FRAME_TIME_VERSION.response.map(di=> ({...di})).slice(-2), 'quantile', 'version')

let probes = [
  {
    name: 'browser_startup_average_time',
    build_id: transformGLAMAPIResponse(BROWSER_STARTUP_BUILD_ID.response, 'quantile', 'build_id'),
    version: transformGLAMAPIResponse(BROWSER_STARTUP_VERSION.response, 'quantile', 'version'),
    probeType: 'scalar',
  },
    {
    name: 'content_frame_time',
    build_id: transformGLAMAPIResponse(CONTENT_FRAME_TIME_BUILD_ID.response, 'quantile', 'build_id'),
    version: transformGLAMAPIResponse(CONTENT_FRAME_TIME_VERSION.response, 'quantile', 'version'),
    probeType: 'scalar',
  },
  {
    name: 'content_frame_time (2 pts)',
  build_id: ctf_buildID02,
  version: ctf_version02,
  probeType: 'histogram-exponential'
  },
  {
    name: 'content_frame_time (1 pt)',
  build_id: ctf_buildID01,
  version: ctf_version01,
  probeType: 'histogram-exponential'
  }
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
