<script>

  import { tweened } from 'svelte/motion';
  import { cubicOut as defaultEasing } from 'svelte/easing';

  export let from = 0;
  export let to = 0;
  export let duration = 750;
  export let easing = defaultEasing;
  
  const tweenValue = tweened(from, { duration, easing });
  
  $: tweenValue.set(to);
  
  </script>
  
  <slot value={$tweenValue}></slot>