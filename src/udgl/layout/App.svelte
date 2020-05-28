<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let orientation = 'vertical';

  const layout = writable({});

  $layout.orientation = orientation;

  setContext('_layout', layout);
</script>

<div
  class="app-layout"
  class:app-layout--vertical={orientation === 'vertical'}
  class:app-layout--horizontal={orientation === 'horizontal'}>
  <slot />
</div>
