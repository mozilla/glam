<script>
import { fly } from 'svelte/transition';
import Button from '../../components/Button.svelte';
import LeftDrawer from '../../components/sections/LeftDrawer.svelte';
import Accordion from '../../components/Accordion.svelte';
import Cancel from '../../components/icons/Cancel.svelte';

import RadioGroup from '../../components/RadioGroup.svelte';
import RadioSelector from '../../components/RadioSelector.svelte';
// import ListDivider from '../../components/ListDivider.svelte';

import {
  store,
  getFieldValueLabel,
  hasDefaultControlFields,
  resetFilters as resetFiltersAction,

} from '../state/store';

import CONFIG from '../config.json';

let visible = true;
let channel;
let aggregationLevel;
let os;
// let version;

function collapseAll() {
  channel.expand(false);
  os.expand(false);
  aggregationLevel.expand(false);
}

const resetFilters = () => {
  resetFiltersAction();
  collapseAll();
};
</script>

<LeftDrawer {visible}>
    <!-- <TelemetryAppBar /> -->
    <div class=left-drawer__header>
        {#if !$hasDefaultControlFields}
            <div transition:fly={{ y: -10, duration: 200 }}
            href='#whatever'>
                <Button on:click={resetFilters} level='medium' compact
                dark>reset filters <Cancel /></Button>
            </div>
        {/if}
    </div>
    <Accordion bind:this={channel}>
        <span slot="title">Channel</span>
        <span slot="description">{getFieldValueLabel('channel', $store.channel)}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => { store.setField('channel', value); }}>
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
            <RadioGroup onSelect={(value) => { store.setField('os', value); }}>
                    {#each CONFIG.fields.os.values as {key, label}, i (key) }
                        <RadioSelector value={key} label={label} group={$store.os} /> 
                    {/each}
            </RadioGroup>
        </span>
    </Accordion>
    <Accordion bind:this={aggregationLevel}>
        <span slot="title">Aggregate By</span>
        <span slot="description">{getFieldValueLabel('aggregationLevel', $store.aggregationLevel)}</span>
        <span slot="content">
            <RadioGroup onSelect={(value) => { store.setField('aggregationLevel', value); }}>
                {#each CONFIG.fields.aggregationLevel.values as {key, label}, i (key)}
                    <RadioSelector value={key} label={label} group={$store.aggregationLevel} />
                {/each}
            </RadioGroup>
        </span>
    </Accordion>
</LeftDrawer>
