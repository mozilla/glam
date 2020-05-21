<script>
import { createEventDispatcher } from 'svelte';
import Button from 'udgl/Button.svelte';
import ButtonGroup from 'udgl/ButtonGroup.svelte';
import ColorSwatch from './ColorSwatch.svelte';

export let level = 'medium';
export let compact = true;
export let options;
export let multi = false;
export let sort = true;
export let reverse = false;
export let selected = multi ? [] : undefined;
export let justify = 'flex-start';

const dispatch = createEventDispatcher();

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

<ButtonGroup {justify}>
  {#each options as {label, value, labelColor, tooltip, component}, i (label)}
    <Button tooltip={tooltip} level={level} compact={compact} toggled={multi
    ? selected.includes(value) : selected === value} on:click={() => { toggle(value); }
    }>
      {#if labelColor}
        <ColorSwatch color={labelColor} />
      {/if}
      {#if component}
        <svelte:component this={component} size={14} />
      {/if}
      {label}
  </Button>
  {/each}
</ButtonGroup>
