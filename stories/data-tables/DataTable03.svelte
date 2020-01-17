<script>
import TableView from '../../src/app/patterns/table-view/TableView.svelte';
import ProbeKeySelector from '../../src/app/patterns/controls/ProbeKeySelector.svelte';
import { percentileLineColorMap } from '../../src/components/data-graphics/utils/color-maps';
import { formatCount, formatPercentDecimal } from '../../src/app/patterns/utils/formatters';

// Proportions
import SSL_RESUMED_SESSION from '../../tests/data/ssl_resumed_session_build_id.json';
import SSL_HANDSHAKE_VERSION from '../../tests/data/ssl_handshake_version_build_id.json';
import CRYPTO from '../../tests/data/cryptominers_blocked_count_build_id.json';
import GCREASON2 from '../../tests/data/gc_reason_2_build_id.json';

// Quantiles
import NAV_URL from '../../tests/data/browser_engagement_navigation_urlbar_build_id.json';
import ACTIVE_TICKS from '../../tests/data/browser_engagement_active_ticks_build_id.json';
import GCMS from '../../tests/data/gc_ms_build_id.json';

import { responseToData, extractBucketMetadata } from '../../src/app/state/store';

const sslResumedSession = responseToData(SSL_RESUMED_SESSION.response, 'proportion', 'histogram-boolean');
const sslHandshakeVersion = responseToData(SSL_HANDSHAKE_VERSION.response, 'proportion', 'histogram-enumerated');
const cryptominersBlockedCount = responseToData(CRYPTO.response, 'proportion', 'histogram-categorical');
const gcReason2 = responseToData(GCREASON2.response, 'proportion', 'histogram-enumerated');

let probes = [
  {
    name: 'SSL_RESUMED_SESSION',
    data: sslResumedSession,
    probeType: 'histogram-boolean',
    class: 'proportion',
    ...extractBucketMetadata(sslResumedSession),
  },
  {
    name: 'SSL_HANDSHAKE_VERSION',
    data: sslHandshakeVersion,
    probeType: 'histogram-enumerated',
    class: 'proportion',
    ...extractBucketMetadata(sslHandshakeVersion),
  },
  {
    name: 'cryptominers_blocked_count',
    data: cryptominersBlockedCount,
    probeType: 'histogram-categorical',
    class: 'proportion',
    ...extractBucketMetadata(cryptominersBlockedCount),
  },
  {
    name: 'gc_reason_2',
    data: gcReason2,
    probeType: 'histogram-enumerated',
    class: 'proportion',
    ...extractBucketMetadata(gcReason2),
  },

  {
    name: 'gc_ms',
    data: responseToData(GCMS.response),
    probeType: 'histogram',
    class: 'quantile',
  },
  {
    name: 'browser_engagement_active_ticks',
    data: responseToData(ACTIVE_TICKS.response),
    probeType: 'scalar',
    class: 'quantile',
  },
  {
    name: 'browser_engagement_navigation_urlbar',
    data: responseToData(NAV_URL.response),
    probeType: 'scalar',
    class: 'quantile',
  },
];

let which;
let probe;
// $: probe = probes[which];

let probeKeys;
let aggregationTypes;
// $: probeKeys = gatherProbeKeys(probes[which].data);
// $: aggregationTypes = gatherAggregationTypes(probes[which].data);

let currentKey;
let currentAggregation;

function gatherProbeKeys(nestedData) {
  return Object.keys(nestedData);
}

function gatherAggregationTypes(nestedData) {
  return Object.keys(Object.values(nestedData)[0]);
}

function setProbeInfo(i) {
  which = i;
  probe = probes[which];
  probe = probes[which];
  probeKeys = gatherProbeKeys(probe.data);
  aggregationTypes = gatherAggregationTypes(probe.data);
  currentKey = probeKeys[0];
  currentAggregation = aggregationTypes[0];
}

setProbeInfo(3);

// everything below this belongs elsewhere.

let pageSize = 15;
let probeKey;
let aggKey;

</script>

<div class=story>

  {#each probes as probeOption, i}
  <label>
    {probeOption.name}
    <input type=radio checked={which === i} value={i} on:input={() => { setProbeInfo(i); }} />
  </label>
  {/each}

  {#if aggregationTypes && aggregationTypes.length > 1}
    {#each aggregationTypes as a, i (a)}
    <label>
      {a}
      <input type=radio bind:group={currentAggregation} value={a} />
    </label>
    {/each}
  {/if}

  {#if probeKeys && probeKeys.length > 1}
    <ProbeKeySelector 
      options={probeKeys}
      bind:currentKey={currentKey}
    />
  {/if}

  {#if probe}
    <TableView 
      data={probe.data}
      colorMap={probe.class === 'proportion' ? probe.bucketColorMap : percentileLineColorMap}
      visibleBuckets={probe.class === 'proportion' ? probe.initialBuckets : [5, 25, 50, 75, 95]}
      keyFormatter={probe.class === 'proportion' ? (v) => v : (v) => `${v}%`}
      valueFormatter={probe.class === 'proportion' ? formatPercentDecimal : formatCount}
      key={probe.class === 'proportion' ? 'proportions' : 'percentiles'}
      currentKey={currentKey}
      currentAggregation={currentAggregation}
    />
  {/if}
</div>