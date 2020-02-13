<script>
  import { getContext } from 'svelte';

  const layoutParams = getContext('_layout');

  export let sticky = false;
  export let orientation = $layoutParams.orientation; // eslint-disable-line
  // fixme: this is probably not how this should be done.
  // we will have to figure out how to theme very soon.
  export let backgroundColor;
  export let textColor;
  let style = '';
  $: style = `
    ${backgroundColor ? `--toolbar-background-color: ${backgroundColor};` : ''}
    ${textColor ? `--toolbar-text-color: ${textColor};` : ''}
  `;

</script>

<header style={style} class=toolbar 
  class:toolbar--sticky={sticky}
  class:toolbar--vertical={orientation === 'vertical'}
  class:toolbar--horizontal={orientation === 'horizontal'}
>
  <slot></slot>
</header>