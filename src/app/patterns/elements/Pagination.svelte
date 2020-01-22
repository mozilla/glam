<script>
import { createEventDispatcher } from 'svelte';
import Button from '../../../components/Button.svelte';
import LeftCarat from '../../../components/icons/LeftCarat.svelte';
import RightCarat from '../../../components/icons/RightCarat.svelte';

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
  grid-template-columns: auto max-content max-content;
  grid-column-gap: var(--space-1h);
  align-items: center;
  align-content: start;
  width: max-content;
  text-transform: uppercase;
  font-size: var(--text-02);
  color: var(--cool-gray-750);
  font-family: var(--main-mono-font);
  padding-left: var(--space-2x);
}

div:hover {
  background-color: var(--cool-gray-subtle);
}

</style>

<div>
    page {currentPage < 9 ? '0' : ''}{currentPage + 1} of {totalPages < 9 ? '0' : ''}{totalPages}
  <Button tooltip="move back a page" on:click={() => changePage(currentPage - 1)} level=low compact><LeftCarat size={10} /></Button>
  <Button tooltip="move forward a page" on:click={() => changePage(currentPage + 1)} level=low compact><RightCarat size={10} /></Button>
</div>