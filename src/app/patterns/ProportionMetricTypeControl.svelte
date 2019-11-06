<script>
  import BodyControl from './BodyControl.svelte';
  
  export let metricType = 'proportions';
  </script>
  
  <BodyControl
    options={[
        { label: 'proportion', value: 'proportions' },
        { label: 'total clients', value: 'counts' },
      ]}
      bind:selected={metricType}
      level="medium"
  />