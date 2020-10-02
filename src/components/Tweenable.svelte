<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut as easing } from 'svelte/easing';

  export let params = { duration: 200, easing };
  export let value = 0;
  export let from = value;

  let tweenValue = tweened(from, params);
  $: tweenValue.set(value);
</script>

<slot tweenValue={$tweenValue} />
