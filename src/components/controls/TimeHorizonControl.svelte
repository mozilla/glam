<script>
  import BodyControl from './BodyControl.svelte';
  import { store } from '../../state/store';

  export let horizon = 'MONTH';

  $: options = [
    {
      label: 'week',
      value: 'WEEK',
      tooltip: 'show the last week of build ids',
      enabled: true,
    },
    {
      label: 'month',
      value: 'MONTH',
      tooltip: 'show the last month of build ids',
      enabled: true,
    },
    {
      label: 'quarter',
      value: 'QUARTER',
      tooltip: 'show the last 3 months of build ids',
      enabled: true,
    },
    {
      label: 'all',
      value: 'ALL',
      tooltip: 'show all available data',
      enabled: true,
    },
    {
      label: 'zoom',
      value: 'ZOOM',
      tooltip: 'custom based on selected range',
      enabled: $store.timeHorizon === 'ZOOM',
    },
  ];
</script>

<BodyControl
  {options}
  selected={horizon}
  level="medium"
  on:selection
  componentName="TimeHorizonControl"
/>
