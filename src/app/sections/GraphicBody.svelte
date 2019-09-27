<script>
import { setContext } from 'svelte';
import {
  store, updateProbe, updateSearchIsActive, dataset,
} from '../store/store';
import TelemetrySearchResults from './TelemetrySearchResults.svelte';

// import Spinner from '../../components/Spinner.svelte';

setContext('updateProbe', store.connect(updateProbe));
setContext('updateSearchIsActive', store.connect(updateSearchIsActive));

</script>

<style>

.graphic-body-container {
    padding: var(--space-2x);
    overflow-y: auto;
    height: calc(100vh - var(--header-height) * 2 - var(--space-4x));
    outline: 1px solid black;
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

    <div>
        {#await $dataset}
            running query
            <!-- <Spinner /> -->
        {:then value}
            <pre>
                {JSON.stringify(value, null, 2)}
            </pre>
        {:catch err}
            An error was caught: {err}
        {/await}
    </div>
</div>
