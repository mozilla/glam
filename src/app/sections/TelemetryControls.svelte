<script>
import { fly } from 'svelte/transition';
import Button from '../../components/Button.svelte';
import LeftDrawer from '../../components/sections/LeftDrawer.svelte';
import Accordion from '../../components/Accordion.svelte';
import Cancel from '../../components/icons/Cancel.svelte';

import RadioGroup from '../../components/RadioGroup.svelte';
import RadioSelector from '../../components/RadioSelector.svelte';
// import ListDivider from '../../components/ListDivider.svelte';

import TelemetryAppBar from './TelemetryAppBar.svelte';

import {
  store,
  getFieldValueLabel,
  hasDefaultControlFields,
  updateChannel as updateChannelAction,
  resetFilters as resetFiltersAction,
  updateOS as updateOSAction,
} from '../store/store';

import CONFIG from '../config.json';

let visible = true;
let channel;
let os;
// let version;

function collapseAll() {
  channel.expand(false);
  os.expand(false);
//   version.expand(false);
}

const updateChannel = store.connect(updateChannelAction);
const updateOS = store.connect(updateOSAction);
const resetFilters = () => {
  const reset = store.connect(resetFiltersAction);
  reset();
  collapseAll();
};
</script>

<LeftDrawer {visible}>
    <TelemetryAppBar />
    <div class=left-drawer__header>
        <h2 class=heading--02>Filters</h2>
        {#if !$hasDefaultControlFields}
            <div transition:fly={{ y: -10, duration: 200 }}
            href='#whatever'>
                <Button on:click={resetFilters} level='medium' compact
                dark>reset filters <Cancel /></Button>
            </div>
        {/if}
    </div>
    <!-- <Accordion bind:this={product}>
        <span slot="title">Product</span>
        <span slot="description">{$store.product}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateProduct(value)}>
                <RadioSelector value={'all'} label={'all products'} group={$store.product} />
                <RadioSelector value={'firefox'} label={'Firefox Desktop'} group={$store.product} />
                <RadioSelector value={'fennec'} label={'Fennec for Android'} group={$store.product} />
            </RadioGroup>
        </span>
    </Accordion> -->
    <!-- <Accordion bind:this={version}>
        <span slot="title">Version / Build</span>
        <span slot="description">Latest (69)</span>
        <span slot="content">
            <div style="padding-left: var(--space-2x); font-size: 14px; opacity:
            .6;">
                (coming soon)
            </div>
        </span>
    </Accordion> -->
    <Accordion bind:this={channel}>
        <span slot="title">Channel</span>
        <span slot="description">{getFieldValueLabel('channel', $store.channel)}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateChannel(value)}>
                {#each CONFIG.fields.channel.values as {key, label}, i (key)}
                    <RadioSelector value={key} label={label} group={$store.channel} />
                {/each}
            </RadioGroup>
        </span>
    </Accordion>
    <Accordion bind:this={os}>
        <span slot="title">Operating System</span>
        <span slot="description">{getFieldValueLabel('os', $store.os)}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => updateOS(value)}>
                    {#each CONFIG.fields.os.values as {key, label}, i (key) }
                        <RadioSelector value={key} label={label} group={$store.os} /> 
                    {/each}
            </RadioGroup>
        </span>
    </Accordion>
</LeftDrawer>
