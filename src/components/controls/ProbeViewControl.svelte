<script>
  import page from 'page';
  import { fly } from 'svelte/transition';
  import { LineChart, Table } from '@graph-paper/icons/';
  import { store, currentQuery } from '../../state/store';

  import BodyControl from './BodyControl.svelte';

  let options = [
    {
      value: 'explore',
      label: 'Explore',
      component: LineChart,
      tooltip: "explore this probe's aggregated values over time",
      enabled: true,
    },
    {
      value: 'table',
      label: 'Table',
      component: Table,
      tooltip: "view this probe's aggregated data in tabular form",
      enabled: true,
    },
  ];
</script>

{#if $store.route.section === 'probe'}
  <div
    transition:fly={{ x: -5, duration: 200 }}
    style="padding-left: var(--space-2x); padding-right: var(--space-2x);">
    <BodyControl
      {options}
      selected={$store.route.view}
      multi={false}
      level="medium"
      on:selection={(evt) => {
        page.show(
          `/${$store.route.product}/${$store.route.section}/${$store.route.probeName}/${evt.detail.selection}${$currentQuery}`
        );
      }} />
  </div>
{/if}
