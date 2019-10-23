<script>
import Button from '../../components/Button.svelte';
import ButtonGroup from '../../components/ButtonGroup.svelte';

export let level = 'medium';
export let compact = true;
export let options;
export let multi = false;
export let selected = multi ? [] : undefined;

function toggle(v) {
  if (multi) {
    if (selected.includes(v)) selected = [...selected.filter((vi) => vi !== v)];
    else {
      selected = [...selected, v];
    }
    selected.sort();
    selected.reverse();
  } else {
    selected = v;
  }
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