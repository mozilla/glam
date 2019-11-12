<script>
import { createEventDispatcher } from 'svelte';
import Button from '../../../../components/Button.svelte';
import LeftCarat from '../../../../components/icons/LeftCarat.svelte';
import RightCarat from '../../../../components/icons/RightCarat.svelte';

export let totalPages;
export let currentPage;

const msg = createEventDispatcher();

function changePage(v) {
  msg('page', {
    page: Math.max(Math.min(totalPages - 1, v), 0),
  });
}

</script>

<style>

div {
  display: grid;
  grid-template-columns: max-content max-content auto;
  grid-column-gap: var(--space-1h);
}

</style>

<div>
  <Button on:click={() => changePage(currentPage - 1)} level=low compact><LeftCarat size={10} /></Button>
  <Button on:click={() => changePage(currentPage + 1)} level=low compact><RightCarat size={10} /></Button>
    page {currentPage + 1} of {totalPages}
</div>