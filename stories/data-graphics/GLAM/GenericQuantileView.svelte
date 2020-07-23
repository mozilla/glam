<script>
import QuantileExplorerView from '../../../src/components/explore/QuantileExplorerView.svelte';
import SCALAR_UINT_BUILD_ID from './scalar_uint_build_id.json';
import SCALAR_UINT_VERSION from './scalar_uint_version.json';
import EXPONENTIAL_HISTOGRAM_BUILD_ID from './exponential_histogram_build_id.json';
import EXPONENTIAL_HISTOGRAM_VERSION from './exponential_histogram_version.json';

import { transformAPIResponse } from '../../../src/utils/transform-data';

import { firefoxVersionMarkers } from '../../../src/state/product-versions';

let which = 0;
let aggregationLevel = 'build_id';

let buildID01 = transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_BUILD_ID.response.map((di) => ({ ...di })).slice(-1), 'build_id');
let version01 = transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_VERSION.response.map((di) => ({ ...di })).slice(-1),  'version');

let buildID02 = transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_BUILD_ID.response.map((di) => ({ ...di })).slice(-2), 'build_id');
let version02 = transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_VERSION.response.map((di) => ({ ...di })).slice(-2),  'version');

let probes = [
  {
    name: 'Scalar (uint)',
    build_id: transformAPIResponse.quantile(SCALAR_UINT_BUILD_ID.response, 'build_id'),
    version: transformAPIResponse.quantile(SCALAR_UINT_VERSION.response,  'version'),
    probeType: 'scalar',
  },
  {
    name: 'Exponential Histogram',
    build_id: transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_BUILD_ID.response, 'build_id'),
    version: transformAPIResponse.quantile(EXPONENTIAL_HISTOGRAM_VERSION.response, 'version'),
    probeType: 'histogram-exponential',
  },
  {
    name: 'Exponential Histogram (2 pts)',
    build_id: buildID02,
    version: version02,
    probeType: 'histogram-exponential',
  },
  {
    name: 'Exponential Histogram (1 pt)',
    build_id: buildID01,
    version: version01,
    probeType: 'histogram-exponential',
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
