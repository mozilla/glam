<script>
import { fly } from 'svelte/transition';
import { store } from '../../state/store';


import BodyControl from './BodyControl.svelte';
import Chart from '../../../components/icons/Chart.svelte';
import Table from '../../../components/icons/Table.svelte';

export let selections;
let options = [
  {
    value: 'explore', label: 'Explore', component: Chart, tooltip: "explore this probe's aggregated values over time",
  },
  {
    value: 'table', label: 'Table', component: Table, tooltip: "view this probe's aggregated data in tabular form",
  },
];

export let colorMap = () => 'black';
export let transformed = options.map((opt) => ({
  label: opt, value: opt,
}));
</script>

{#if $store.appView === 'PROBE'}
<div transition:fly={{ x: -5, duration: 200 }} style="padding-left: var(--space-4x); padding-right: var(--space-4x);">
  <BodyControl
    options={options}
    selected={$store.probeView}
    multi={false}
    level="medium"
    on:selection={(evt) => {
      store.setField('probeView', evt.detail.selection);
    }}
  />
</div>
{/if}
