<script>
  import TempDataForProcessMissingError from './TempDataForProcessMissingError.svelte';
  import DataErrorGeneric from './DataErrorGeneric.svelte';

  export let reason;
  export let moreInformation;
  export let statusCode;
</script>

{#if statusCode === 404}
  <TempDataForProcessMissingError />
{:else}
  <DataErrorGeneric {reason} {moreInformation} />
{/if}
