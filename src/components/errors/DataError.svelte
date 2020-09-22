<script>
import DataErrorGeneric from './DataErrorGeneric.svelte';

export let reason;
export let moreInformation;
</script>

<DataErrorGeneric {reason} {moreInformation} />
