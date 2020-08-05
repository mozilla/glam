<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import LineSegSpinner from 'udgl/LineSegSpinner.svelte';
import { store } from '../../state/store';

const paneTransition = { x: 10, duration: 300 };

let visible = false;
onMount(() => { visible = true; });

function probeIsSelected(probeToTest) {
  return probeToTest && probeToTest.name !== null && probeToTest.name !== 'null';
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
{#if !$store.probe.loaded}
    {#if visible}
    <div in:fly={paneTransition} class="drawer-section">
        <div class="spinner-and-text">
            <LineSegSpinner size={48} color={'var(--cool-gray-400)'} />
            <div in:fade={{ duration: paneTransition.duration * 2 }}>Loading Probes</div>
        </div>
    </div>
    {/if}
{:else if probeIsSelected($store.probe)}
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
