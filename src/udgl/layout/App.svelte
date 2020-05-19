<script>
import { setContext } from 'svelte';
import { writable } from 'svelte/store';

export let orientation = 'vertical';

const layout = writable({});

$layout.orientation = orientation;

setContext('_layout', layout);
</script>

<style>
.app-layout {
  display: grid;
  min-height: 100vh;
}

.app-layout--vertical {
  grid-template-rows: max-content auto;
}

.app-layout--horizontal {
  grid-template-columns: var(--drawer-width) auto;
}
</style>

<div
  class="app-layout"
  class:app-layout--vertical={orientation === 'vertical'}
  class:app-layout--horizontal={orientation === 'horizontal'}
>
  <slot></slot>
</div>
