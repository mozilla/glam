<script>
import ProportionTable from '../../../src/app/patterns/body/elements/ProportionTable.svelte';
import SSL_RESUMED_SESSION from '../../../tests/data/ssl_resumed_session_build_id.json';
import SSL_HANDSHAKE_VERSION from '../../../tests/data/ssl_handshake_version_build_id.json';
import CRYPTO from '../../../tests/data/cryptominers_blocked_count_build_id.json';
import GCREASON2 from '../../../tests/data/gc_reason_2_build_id.json';

import { responseToData, extractBucketMetadata } from '../../../src/app/state/store';

const sslResumedSession = responseToData(SSL_RESUMED_SESSION.response, 'proportion', 'histogram-boolean');
const sslHandshakeVersion = responseToData(SSL_HANDSHAKE_VERSION.response, 'proportion', 'histogram-enumerated');
const cryptominersBlockedCount = responseToData(CRYPTO.response, 'proportion', 'histogram-categorical');
const gcReason2 = responseToData(GCREASON2.response, 'proportion', 'histogram-enumerated');

function getExampleData(data) {
  let dataset = [...Object.values(Object.values(data)[0])[0]];
  dataset = dataset.slice(0, -1);
  dataset.reverse();
  return dataset;
}


let probes = [
  {
    name: 'SSL_RESUMED_SESSION',
    data: sslResumedSession,
    probeType: 'histogram-boolean',
    ...extractBucketMetadata(sslResumedSession),
  },
  {
    name: 'SSL_HANDSHAKE_VERSION',
    data: sslHandshakeVersion,
    probeType: 'histogram-enumerated',
    ...extractBucketMetadata(sslHandshakeVersion),
  },
  {
    name: 'cryptominers_blocked_count',
    data: cryptominersBlockedCount,
    probeType: 'histogram-categorical',
    ...extractBucketMetadata(cryptominersBlockedCount),
  },
  {
    name: 'gc_reason_2',
    data: gcReason2,
    probeType: 'histogram-enumerated',
    ...extractBucketMetadata(gcReason2),
  },
];

let which = 0;
let currentPage = 0;

function updatePage(event) {
  currentPage = event.detail.page;
}
let activeBuckets = [];
$: if (which) currentPage = 0;
$: activeBuckets = probes[which].initialBuckets;

let metricType = 'proportions';

</script>

<div class=story>
    <div class='view-header'>
        <h1>Quantile Table</h1>
        <div class='selectors'>
          {#each probes as {name, data}, i}
            <label>
              <input type=radio bind:group={which} value={i}>
              {name}
            </label>
          {/each}
          </div>
    </div>
  <div style='width: 936px'>
    {#each probes as probe, i}
      {#if i === which}
        <ProportionTable 
          on:page={updatePage} 
          {currentPage} 
          data={getExampleData(probe.data)}
          metricType={metricType}
          probeType={probe.probeType}
          activeBuckets={activeBuckets}
          bucketColorMap={probe.bucketColorMap}
          />
      {/if}
    {/each}
    
  </div>
</div>