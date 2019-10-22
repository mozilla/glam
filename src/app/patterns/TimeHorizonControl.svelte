<script>
import BodyControl from './BodyControl.svelte';

export let horizon = 'ALL_TIME';
</script>

<BodyControl
  options={[
      { label: 'last week', value: 'WEEK' },
      { label: 'last month', value: 'MONTH' },
      { label: 'all time', value: 'ALL_TIME' },
    ]}
    bind:selected={horizon}
    level="medium"
/>