<script>
import { getContext } from 'svelte';

const key = getContext('key');
</script>

<g id='graphic-body-content-{key}' style="clip-path: url(#graphic-body-{key})">
  <slot></slot>
</g>