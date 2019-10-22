<script>
import BodyControl from './BodyControl.svelte';

export let percentiles = [50];
</script>

<BodyControl
  options={[
      { label: '5%', value: 5 },
      { label: '25%', value: 25 },
      { label: '50%', value: 50 },
      { label: '75%', value: 75 },
      { label: '95%', value: 95 },
    ]}
    bind:selected={percentiles}
    multi={true}
    level="low"
/>