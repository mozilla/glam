<script>
  import DataErrorGeneric from './DataErrorGeneric.svelte';

  export let reason;
  export let moreInformation;
  export let link = null;
</script>

<DataErrorGeneric {reason} {moreInformation} {link} />
