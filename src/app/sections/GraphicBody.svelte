<script>
import { setContext } from 'svelte';
import { searchQuery, store, updateProbe } from '../store/store.js';
import TelemetrySearchResults from './TelemetrySearchResults.svelte';

// updateProbe could easily just be put into TelemetrySearchResults since
// it is a consumer
setContext('updateProbe', store.connect(updateProbe));

</script>

<style>

.graphic-body-container {
    padding: var(--space-2x);
}



.graphic-body__graphic-header {
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    align-items: start;
}

.graphic-body__graphic-header h2 {
    margin:0;
    padding:0;
    width: 100%;
    word-break: break-all;
}

/* .label {
    border-radius: var(--border-radius-1h);
    font-size:.75em;
    text-transform: uppercase;
    color: white;
    display:grid;
    align-items: center;
    align-self: start;
    background-color: var(--subhead-gray);
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
} */

</style>


<TelemetrySearchResults />

<div class=graphic-body-container>

    <div class=graphic-body__graphic-header>
    {#if $store.probe.name}
        <h2 class='heading--03'>{$store.probe.name}</h2>
        <div class='label label--{$store.probe.probeType} label-text--01'>{$store.probe.probeType}</div>
    {:else}
        <h2 class='heading--04'>Telemetry Prototype</h2>
    {/if}
    </div>

</div>