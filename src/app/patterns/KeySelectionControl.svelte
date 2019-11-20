<script>
  import BodyControl from "./BodyControl.svelte";

  export let selections;
  export let options;

  export let sortFunction;
  export let colorMap = () => "black";
  export let transformed = options.map(opt => ({
    label: opt,
    value: opt,
    labelColor: colorMap(opt)
  }));
</script>

<BodyControl
  sort={sortFunction}
  options={transformed}
  selected={selections}
  multi={true}
  level="low"
  on:selection />
