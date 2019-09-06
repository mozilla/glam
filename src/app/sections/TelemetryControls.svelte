<script>
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import Button from '../../components/Button.svelte';
import LeftDrawer from '../../components/sections/LeftDrawer.svelte';
import Accordion from '../../components/Accordion.svelte';
import Cancel from '../../components/icons/Cancel.svelte';

import RadioGroup from '../../components/RadioGroup.svelte';
import RadioSelector from '../../components/RadioSelector.svelte';
import ListDivider from '../../components/ListDivider.svelte';
import { 
    store, 
    notDefaultSettings,
    updateProduct as updateProductAction,
    updateChannel as updateChannelAction,
    resetFilters as resetFiltersAction,
    updateOS as updateOSAction } from '../store/store'

const updateProduct = store.connect(updateProductAction);
const updateChannel = store.connect(updateChannelAction);
const updateOS = store.connect(updateOSAction);
const resetFilters = () => {
    let reset = store.connect(resetFiltersAction)
    reset();
    collapseAll();
};
let visible = true;

let product;
let channel;
let os;
let version;
function collapseAll() {
    product.expand(false);
    channel.expand(false);
    os.expand(false);
    version.expand(false);
}


</script>

<LeftDrawer {visible}>
    <div class=primary-controls-header>
        <h2 class=heading--02>Filters</h2>
        {#if $notDefaultSettings}
            <div transition:fly={{y:-10, duration:200}}
            href='#whatever'>
                <Button on:click={resetFilters} level='medium' compact
                dark>reset filters <Cancel /></Button>
            </div>
        {/if}
    </div>
    <Accordion bind:this={product}>
        <span slot="title">Product</span>
        <span slot="description">{$store.product}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateProduct(value)}>
                <RadioSelector value={'all'} label={'all products'} group={$store.product} />
                <RadioSelector value={'firefox'} label={'Firefox Desktop'} group={$store.product} />
                <RadioSelector value={'fennec'} label={'Fennec for Android'} group={$store.product} />
            </RadioGroup>
        </span>
    </Accordion>
    <Accordion bind:this={version}>
        <span slot="title">Version / Build</span>
        <span slot="description">Latest (69)</span>
        <span slot="content">
            <div style="padding-left: var(--space-2x); font-size: 14px; opacity:
            .6;">
                (coming soon)
            </div>
        </span>
    </Accordion>
    <Accordion  bind:this={channel}>
        <span slot="title">Channel</span>
        <span slot="description">{$store.channel}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateChannel(value)}>
                <RadioSelector value={'all'} label={'all products'}
                group={$store.channel} />
                <!-- <ListDivider /> -->
                <RadioSelector value={'nightly'} label={'Nightly'} group={$store.channel} />
                <RadioSelector value={'beta'} label={'Beta'} group={$store.channel} />
                <RadioSelector value={'release'} label={'Release'} group={$store.channel} />
            </RadioGroup>
        </span>
    </Accordion>
    <Accordion  bind:this={os}>
        <span slot="title">Operating System</span>
        <span slot="description">{$store.os}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateOS(value)}>
                <RadioSelector value={'all'} label={'all OSes'} group={$store.os} />
                <RadioSelector value={'Windows'} label={'Windows'} group={$store.os} />
                <RadioSelector value={'Mac'} label={'Mac'} group={$store.os} />
                <RadioSelector value={'Linux'} label={'Linux'} group={$store.os} />
            </RadioGroup>
        </span>
    </Accordion>
    <!-- <Accordion>
        <span slot="title">Country</span>
        <span slot="description">{$store.os}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateOS(value)}>
                {#each new Array(40).fill(null).map(() => 'a') as a, i}
                    <RadioSelector value={a} group={$store.os} />
                {/each}
            </RadioGroup>
        </span>
    </Accordion> -->
    <!-- <Accordion>
        <span slot="title">Channel</span>
        <span slot="description">all channels</span>
        <span slot="content">
        </span>
    </Accordion>
    <Accordion>
        <span slot="title">Versions</span>
        <span slot="description">all channels</span>
        <span slot="content">
        </span>
    </Accordion> -->
</LeftDrawer>

<!-- <button class=fab on:click={() => { visible = !visible; }}>{visible ? "hide" : "show"}</button> -->