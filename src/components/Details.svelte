<script>
import { fly } from 'svelte/transition';
import { store } from '../store/store.js';
import DetailSection from './DetailSection.svelte';
let visible = true;
</script>

<style>

.details {
    border-left: 1px solid gainsboro;
    min-height: var(--details-draw-height);
}

.show {
    position: absolute;
    justify-self: end;
}

</style>

{#if !visible}
    <button class=show transition:fly={{x: 200, duration: 200}} on:click={()=> { visible = true;}}>show details</button>
{/if}

{#if visible}
<div transition:fly={{x: 200, duration: 200}} class=details>
    <button on:click={() => { visible = false }}>hide details</button>
    <!-- <h3>Details</h3> -->

    <DetailSection>
        <span slot='title'>
            {$store.probe}
        </span>
        <span slot='content'>
            
        </span>
    </DetailSection>
    <DetailSection>
        <span slot='title'>
            Audience Size
        </span>
        <span slot='content'>
            
        </span>
    </DetailSection>
    <DetailSection>
        <span slot='title'>
            Probe Description
        </span>
    </DetailSection>
    <DetailSection>
        <span slot='title'>
            Related Probes
        </span>
    </DetailSection>
    <DetailSection>
        <span slot="title">
            Export
        </span>
    </DetailSection>
</div>
{/if}