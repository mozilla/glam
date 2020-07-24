<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';
import StatusLabel from 'udgl/StatusLabel.svelte';
import ExternalLink from 'udgl/icons/ExternalLink.svelte';
import Doc from '../Doc.svelte';
import Brackets from '../Brackets.svelte';
import telemetrySearch from '../../state/telemetry-search';
import { store, probe, dataset } from '../../state/store';

import { downloadString } from '../../utils/download';


const paneTransition = { x: 10, duration: 300 };
const PROBE_TYPE_DOCS = {
  histogram: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/histograms.html',
  scalar: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/scalars.html',
  event: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/events.html',
  default: 'https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/collection/index.html',
};

let visible = false;
onMount(() => { visible = true; });

function probeIsSelected(probeToTest) {
  return probeToTest && probeToTest.name !== null && probeToTest.name !== 'null';
}

async function exportData() {
  const data = await $dataset;
  downloadString(JSON.stringify(data), 'text', `${$probe.name}.json`);
}

</script>

<style>

.drawer-section {
    padding: var(--space-2x) 0;
}

.probe-details {
    height: 100%;
}
.empty-details {
    height: 200px;
    display: grid;
    place-items: center center;
    font-weight: 900;
    font-size: 1.2em;
    text-align: center;
    padding: var(--space-2x);
    color: var(--cool-gray-400);
}


.spinner-and-text {
    text-align: center;
    color: var(--cool-gray-400);
}

.spinner-and-text div {
    margin-top: var(--space-base);
}

</style>

<div class="drawer details-drawer">
{#if !$telemetrySearch.loaded}
    {#if visible}
    <div in:fly={paneTransition} class="drawer-section">
        <div class="spinner-and-text">
            <LineSegSpinner size={48} color={'var(--cool-gray-400)'} />
            <div in:fade={{ duration: paneTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if probeIsSelected($probe)}
<div in:fly={paneTransition} class="drawer-section-container probe-details">
  <slot></slot>
</div>
{:else}
    <div class="drawer-section">
        <div class="empty-details">
            search for a telemetry probe above
        </div>
    </div>
{/if}
</div>
