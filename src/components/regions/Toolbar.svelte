<script>
  import { getContext } from 'svelte';

  const layoutParams = getContext('_layout');

  export let sticky = false;
  export let orientation = $layoutParams.orientation; // eslint-disable-line

</script>

<header class=toolbar
  class:toolbar--sticky={sticky}
  class:toolbar--vertical={orientation === 'vertical'}
  class:toolbar--horizontal={orientation === 'horizontal'}
>
  <slot></slot>
</header>
