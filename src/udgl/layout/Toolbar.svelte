<script>
  import { getContext } from 'svelte';

  const layoutParams = getContext('_layout');

  export let sticky = false;
  export let orientation = $layoutParams.orientation; // eslint-disable-line

</script>

<style>
  header {
    min-width: var(--space-24x);
    width: 100%;
    height: var(--header-height);
    background-color: var(--blue-slate-700);
    box-sizing: border-box;
    color: var(--primary-text);
    display: grid;
    align-content: center;
    align-items: center;
  }

  .toolbar {
    align-self: start;
    width: 100%;
    height: 100%;
    min-height: var(--header-height);
    display: grid;
    z-index: 100;
    background-color: var(--toolbar-background-color);
    color: var(--toolbar-text-color);
  }

  .toolbar--horizontal {
    box-sizing: border-box;
    align-content: start;
    padding-top: var(--space-2x);
    padding-bottom: var(--space-2x);
    align-items: start;
    justify-items: end;
    grid-auto-flow: row;
    grid-row-gap: var(--space-2x);
  }

  .toolbar--vertical {
    grid-auto-flow: column;
    grid-column-gap: var(--space-2x);
  }

  .toolbar--sticky {
    position: sticky;
    top: 0;
  }
</style>

<header class="toolbar"
  class:toolbar--sticky={sticky}
  class:toolbar--vertical={orientation === 'vertical'}
  class:toolbar--horizontal={orientation === 'horizontal'}
>
  <slot></slot>
</header>
