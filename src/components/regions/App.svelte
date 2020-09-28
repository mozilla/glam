<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let orientation = 'vertical';

  const layout = writable({});

  $layout.orientation = orientation;

  setContext('_layout', layout);
</script>

<div class="app-layout app-layout--vertical">
  <slot />
</div>
