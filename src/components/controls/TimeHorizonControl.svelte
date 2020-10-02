<script>
  import BodyControl from './BodyControl.svelte';

  export let horizon = 'MONTH';

  const options = [
    {
      label: 'week',
      value: 'WEEK',
      tooltip: 'show the last week of build ids',
    },
    {
      label: 'month',
      value: 'MONTH',
      tooltip: 'show the last month of build ids',
    },
    {
      label: 'quarter',
      value: 'QUARTER',
      tooltip: 'show the last 3 months of build ids',
    },
    {
      label: 'all',
      value: 'ALL',
      tooltip: 'show all available data',
    },
  ];
</script>

<BodyControl {options} selected={horizon} level="medium" on:selection />
