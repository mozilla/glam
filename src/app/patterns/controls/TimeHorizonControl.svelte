<script>
import BodyControl from './BodyControl.svelte';

export let horizon = 'MONTH';
</script>

<BodyControl
  options={[
      { label: 'last week', value: 'WEEK', tooltip: 'show the last week of build ids' },
      { label: 'last month', value: 'MONTH', tooltip: 'show the last month of build ids' },
      { label: 'all time', value: 'ALL_TIME', tooltip: 'show all build ids available for this probe' },
    ]}
    selected={horizon}
    level="medium"
    on:selection
/>