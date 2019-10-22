<script>
import { fade } from 'svelte/transition';
import {
  store, dataset,
} from '../store/store';

import ScalarAggregationView from '../patterns/body/scalars/ScalarAggregationView.svelte';

</script>

<style>
.graphic-body-container {
    padding: var(--space-4x);
    overflow-y: auto;
    height: calc(100vh - var(--header-height) - var(--space-4x));
    background-color: white;
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

.TEMP {
    background-color: white;
    padding: var(--space-2x)
}

</style>

<div class=graphic-body-container>

    <div class=graphic-body__graphic-header>
    {#if $store.probe.name}
        <h2 class='heading--03'>{$store.probe.name}</h2>
    {:else}
        <h2 class='heading--04'>Telemetry Prototype</h2>
    {/if}
    </div>

    <div class=TEMP>
        {#await $dataset}
            running query
            <!-- <Spinner /> -->
        {:then value}
            <div in:fade>
                <ScalarAggregationView data={value.response} />
            </div>
            <!-- <pre>
                {JSON.stringify(value, null, 2)}
            </pre> -->
        {:catch err}
            An error was caught: {err}
        {/await}
    </div>
</div>
