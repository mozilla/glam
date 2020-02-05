<script>
import { createEventDispatcher } from 'svelte';
import Button from 'udgl/Button.svelte';
import ButtonGroup from 'udgl/ButtonGroup.svelte';
import LeftCarat from 'udgl/icons/LeftCarat.svelte';
import RightCarat from 'udgl/icons/RightCarat.svelte';

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
  grid-template-columns: max-content auto;
  grid-column-gap: var(--space-base);
  align-items: center;
  align-content: start;
  width: max-content;
  text-transform: uppercase;
  font-size: var(--text-02);
  color: var(--cool-gray-750);
  padding-right: var(--space-2x);
}

div:hover {
  background-color: var(--cool-gray-subtle);
}

</style>

<div>
  <ButtonGroup>
    <Button tooltip="move back a page" on:click={() => changePage(currentPage - 1)} level=medium compact><LeftCarat size={10} /></Button>
    <Button tooltip="move forward a page" on:click={() => changePage(currentPage + 1)} level=medium compact><RightCarat size={10} /></Button>
  </ButtonGroup>
  page {currentPage < 9 ? '0' : ''}{currentPage + 1} of {totalPages < 9 ? '0' : ''}{totalPages}

</div>