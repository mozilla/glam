<script>
import { fly } from 'svelte/transition';
import Chart from 'udgl/icons/Chart.svelte';
import Table from 'udgl/icons/Table.svelte';
import { store, currentQuery } from '../../state/store';
import { navigate } from '../../routing/Router.svelte';


import BodyControl from './BodyControl.svelte';

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

{#if $store.route.section === 'probe'}
<div transition:fly={{ x: -5, duration: 200 }} style="padding-left: var(--space-4x); padding-right: var(--space-4x);">
  <BodyControl
    options={options}
    selected={$store.route.view}
    multi={false}
    level="medium"
    on:selection={(evt) => {
      navigate(`/${$store.route.product}/${$store.route.section}/${$store.route.probeName}/${evt.detail.selection}`, $currentQuery);
    }}
  />
</div>
{/if}
