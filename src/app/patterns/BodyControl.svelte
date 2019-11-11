<script>
import { createEventDispatcher } from 'svelte';
import Button from '../../components/Button.svelte';
import ButtonGroup from '../../components/ButtonGroup.svelte';

export let level = 'medium';
export let compact = true;
export let options;
export let multi = false;
export let sort = true;
export let reverse = false;
export let selected = multi ? [] : undefined;

const dispatch = createEventDispatcher();

$: if (selected && multi && sort && typeof sort === 'function') {
  // selected.sort(sort);
}
// FIXME: support an on:select event as well, in case that is what people want to use here.
function toggle(v) {
  let selection;
  if (multi) {
    if (selected.includes(v)) selection = [...selected.filter((vi) => vi !== v)];
    else {
      selection = [...selected, v];
    }
    if (sort) {
      let sortCallback = (a, b) => (a < b ? -1 : 1);
      if (typeof sort === 'function') {
        sortCallback = sort;
      }
      selection.sort(sortCallback);
    }
    if (reverse) selection.reverse();
  } else {
    selection = v;
  }

  dispatch('selection', { selection });
}

</script>

<style>
.label-color {
  border-radius: var(--space-1q);
  width: calc(var(--space-base) * 1.5);
  height: calc(var(--space-base) * 1.5);
  align-self: center;
}
</style>

<ButtonGroup>
  {#each options as {label, value, labelColor}, i (label)}
    <Button level={level} compact={compact} toggled={multi
    ? selected.includes(value) : selected === value} on:click={() => { toggle(value); }
    }>
      {#if labelColor}
        <div class='label-color' style="background-color: {labelColor};" />
      {/if}
      {label}
  </Button>
  {/each}
</ButtonGroup>