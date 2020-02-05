<script>

import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';

export let params = { duration: 500, easing };
export let value = 0;

const tweenValue = tweened(value, params);
$: tweenValue.set(value);

</script>

<slot tweenValue={$tweenValue}></slot>