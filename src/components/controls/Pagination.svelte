<script>
  import { createEventDispatcher } from 'svelte';
  import { Button, ButtonGroup } from '@graph-paper/button';
  import { CaretLeft, CaretRight } from '@graph-paper/icons';

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
    <Button
      tooltip="move back a page"
      on:click={() =>
        currentPage === 0 ? undefined : changePage(currentPage - 1)}
      level="medium"
      compact
    >
      <CaretLeft size={10} />
    </Button>
    <Button
      tooltip="move forward a page"
      on:click={() => changePage(currentPage + 1)}
      level="medium"
      compact
    >
      <CaretRight size={10} />
    </Button>
  </ButtonGroup>
  page
  {currentPage < 9 ? '0' : ''}{Number(currentPage) + 1}
  of
  {totalPages < 9 ? '0' : ''}{totalPages}
</div>
