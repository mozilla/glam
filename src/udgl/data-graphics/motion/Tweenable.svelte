<script>
  import { onMount } from 'svelte'; //eslint-disable-line
  import { tweened } from 'svelte/motion'; //eslint-disable-line
  import { cubicOut as easing } from 'svelte/easing'; //eslint-disable-line

  export let params = { duration: 200, easing };
  export let value = 0;
  export let from = value;

  let t = tweened(from, params);
  $: t.set(value);
</script>

<slot tweenValue={$t} />
