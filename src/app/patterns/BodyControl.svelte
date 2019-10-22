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

<ButtonGroup>
  {#each options as {label, value}, i (label)}
    <Button level={level} compact={compact} toggled={multi
    ? selected.includes(value) : selected === value} on:click={() => { toggle(value); }
    }>{label}</Button>
  {/each}
</ButtonGroup>