<script>
  import BodyControl from './BodyControl.svelte';

  export let metricType = 'proportions';
</script>

<BodyControl
  options={[
    {
      label: 'proportion',
      value: 'proportions',
      tooltip: 'shows proportions of clients for each category',
      enabled: true,
    },
    {
      label: 'total clients',
      value: 'counts',
      tooltip: 'shows the volume of clients for each category',
      enabled: true,
    },
  ]}
  selected={metricType}
  level="medium"
  on:selection
/>
