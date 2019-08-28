<script>
import { Label } from 'sveltestrap';

export let formId;
export let label;
export let options;
export let current;
export let onChange;
</script>

<Label for="{formId}">{label}</Label>
<!-- Using bootstrap HTML here (vs sveltestrap) to add the onChange handler -->
<select class="form-control" name="{formId}" id="{formId}" bind:value={current} on:change={() => onChange(current)}>
    {#each options as option}
        <option value={option}>
            {option}
        </option>
    {/each}
</select>

