<script>
import BodyControl from './BodyControl.svelte';

export let selections;
export let sortFunction;
export let colorMap = () => 'black';
export let transformed = selections.map((opt) => ({
  label: opt, value: opt, labelColor: colorMap(opt),
}));

</script>

<BodyControl
  sort={sortFunction}
  options={transformed}
  bind:selected={selections}
  multi={true}
  level="low"
/>