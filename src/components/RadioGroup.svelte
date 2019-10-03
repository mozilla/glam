<script>
import { setContext } from 'svelte';

export let onSelect;

if (onSelect) {
  setContext('onSelect', onSelect);
}

</script>

<style>
fieldset {
    border: none;
    padding:0;
    margin:0;
}

/* .options {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
} */

</style>

<fieldset>
    <!-- <legend class='label'>
        <slot name='label'></slot>
    </legend> -->
    <div class=options role=radiogroup>
        <slot>
        </slot>
    </div>
</fieldset>
