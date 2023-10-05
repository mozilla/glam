<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions/tooltip';
  import { Help } from '@graph-paper/icons';

  export let description;
  export let left = 0;
  export let right = 0;
  export let helpIconPosition = 'end';
</script>

<h3
  style="padding-left: {left}px; padding-right: {right}px"
  class="data-graphic__element-title"
>
  {#if helpIconPosition === 'start'}
    <span
      use:tooltipAction={{ text: description, location: 'top' }}
      class="data-graphic__element-title__icon"><Help size={14} /></span
    >
  {/if}
  <slot />
  {#if helpIconPosition === 'end'}
    <span
      use:tooltipAction={{ text: description, location: 'top' }}
      class="data-graphic__element-title__icon"><Help size={14} /></span
    >
  {/if}
</h3>
