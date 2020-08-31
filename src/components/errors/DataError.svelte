<script>
import TempDataForProcessMissingError from './TempDataForProcessMissingError.svelte';
import DataErrorGeneric from './DataErrorGeneric.svelte';

export let reason;
export let moreInformation;
export let statusCode;
export let product = 'firefox';
</script>
<!-- FIXME: this is firefox-specific. -->
{#if statusCode === 404 && product === 'firefox'}
  <TempDataForProcessMissingError />
{:else}
  <DataErrorGeneric {reason} {moreInformation} />
{/if}
