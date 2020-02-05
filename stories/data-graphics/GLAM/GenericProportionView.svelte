<script>
import ProportionExplorerView from '../../../src/routes/explore/_view/ProportionExplorerView.svelte';
import SSL_RESUMED_SESSION_BUILD_ID from '../../../tests/data/ssl_resumed_session_build_id.json';
import SSL_RESUMED_SESSION_VERSION from '../../../tests/data/ssl_resumed_session_version.json';
import SSL_HANDSHAKE_VERSION_BUILD_ID from '../../../tests/data/ssl_handshake_version_build_id.json';
import SSL_HANDSHAKE_VERSION_VERSION from '../../../tests/data/ssl_handshake_version_version.json';

import CRYPTO_BUILD_ID from '../../../tests/data/cryptominers_blocked_count_build_id.json';
import CRYPTO_VERSION from '../../../tests/data/cryptominers_blocked_count_version.json';

import GCREASON2_BUILD_ID from '../../../tests/data/gc_reason_2_build_id.json';
import GCREASON2_VERSION from '../../../tests/data/gc_reason_2_version.json';

import { firefoxVersionMarkers } from '../../../src/state/product-versions';

import { responseToData, extractBucketMetadata } from '../../../src/state/store';

// build_id -level data.
const sslResumedSessionBuildID = responseToData(SSL_RESUMED_SESSION_BUILD_ID.response, 'proportion', 'histogram-boolean');
const sslHandshakeVersionBuildID = responseToData(SSL_HANDSHAKE_VERSION_BUILD_ID.response, 'proportion', 'histogram-enumerated');
const cryptominersBlockedCountBuildID = responseToData(CRYPTO_BUILD_ID.response, 'proportion', 'histogram-categorical');
const gcReason2BuildID = responseToData(GCREASON2_BUILD_ID.response, 'proportion', 'histogram-enumerated');

const sslResumedSessionVersion = responseToData(SSL_RESUMED_SESSION_VERSION.response, 'proportion', 'histogram-boolean', 'version');
const sslHandshakeVersionVersion = responseToData(SSL_HANDSHAKE_VERSION_VERSION.response, 'proportion', 'histogram-enumerated', 'version');
const cryptominersBlockedCountVersion = responseToData(CRYPTO_VERSION.response.slice(-1), 'proportion', 'histogram-categorical', 'version');
const gcReason2Version = responseToData(GCREASON2_VERSION.response, 'proportion', 'histogram-enumerated', 'version');


let probes = [
  {
    name: 'SSL_RESUMED_SESSION',
    build_id: {
      data: sslResumedSessionBuildID,
      ...extractBucketMetadata(sslResumedSessionBuildID),
    },
    version: {
      data: sslResumedSessionVersion,
      ...extractBucketMetadata(sslResumedSessionVersion),
    },
    probeType: 'histogram-boolean',
  },
  {
    name: 'SSL_HANDSHAKE_VERSION',
    build_id: {
      data: sslHandshakeVersionBuildID,
      ...extractBucketMetadata(sslHandshakeVersionBuildID),
    },
    version: {
      data: sslHandshakeVersionVersion,
      ...extractBucketMetadata(sslHandshakeVersionVersion),
    },
    probeType: 'histogram-enumerated',
  },
  {
    name: 'cryptominers_blocked_count',
    build_id: {
      data: cryptominersBlockedCountBuildID,
      ...extractBucketMetadata(cryptominersBlockedCountBuildID),
    },
    version: {
      data: cryptominersBlockedCountVersion,
      ...extractBucketMetadata(cryptominersBlockedCountVersion),
    },
    probeType: 'histogram-categorical',

  },
  {
    name: 'gc_reason_2',
    build_id: {
      data: gcReason2BuildID,
      ...extractBucketMetadata(gcReason2BuildID),
    },
    version: {
      data: gcReason2Version,
      ...extractBucketMetadata(gcReason2Version),
    },
    probeType: 'histogram-enumerated',

  },
];

let which = 0;
let aggregationOptions = [{ name: 'By Build ID', key: 'build_id' }, { name: 'By Version', key: 'version' }];
let aggregationLevel = 'build_id';

let timeHorizon = 'MONTH';
let metricType = 'proportions';
let activeBuckets = probes[which][aggregationLevel].initialBuckets;
$: activeBuckets = probes[which][aggregationLevel].initialBuckets;
function handleSelection(event) {
  const { selection, type } = event.detail;
  if (type === 'timeHorizon') timeHorizon = selection;
  if (type === 'metricType') metricType = selection;
  if (type === 'activeBuckets') activeBuckets = selection;
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
  font-family: var(--main-mono-font);
  border-bottom: 3px solid var(--cool-gray-200);
  margin-bottom: var(--space-4x);
  grid-column-gap: var(--space-2x);
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
          <h1>Proportion Explorer</h1>
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
    {#each probes as probe, i (probe.name + probe.probeType + aggregationLevel)}
      
      {#if which === i}
        <ProportionExplorerView
          probeType={probe.probeType}
          data={probe[aggregationLevel].data}
          timeHorizon={timeHorizon}
          metricType={metricType}
          activeBuckets={activeBuckets}
          on:selection={handleSelection}
          markers={$firefoxVersionMarkers} 
          bucketOptions={probe[aggregationLevel].bucketOptions}
          bucketColorMap={probe[aggregationLevel].bucketColorMap}
          bucketSortOrder={probe[aggregationLevel].bucketSortOrder}
          aggregationLevel={aggregationLevel}
        />
      {/if}
    {/each}
  </div> 
</div>