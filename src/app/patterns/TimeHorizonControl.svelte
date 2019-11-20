<script>
  import BodyControl from "./BodyControl.svelte";

  export let horizon = "MONTH";
</script>

<BodyControl
  options={[{ label: 'last week', value: 'WEEK' }, { label: 'last month', value: 'MONTH' }, { label: 'all time', value: 'ALL_TIME' }]}
  selected={horizon}
  level="medium"
  on:selection />
