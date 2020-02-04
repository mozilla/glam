<script>
import { setContext } from 'svelte';
import { writable } from 'svelte/store';

export let layoutType = 'vertical';

const layout = writable({});
$layout.orientation = layoutType;
setContext('_layout', layout);

</script>

<div 
  class=app-layout
  class:app-layout--vertical={layoutType === 'vertical'}
  class:app-layout--horizontal={layoutType === 'horizontal'}
>
  <slot></slot>
</div>