<script>
import { getContext } from 'svelte';

export let header = getContext('header') || false;
export let freezeX = false;
export let freezeY = false;
export let rightBorder = false;
export let leftBorder = false;
export let topBorder = false;
export let bottomBorder = false;
export let padding = true;
export let text = false;
export let colspan = 1;
export let size = 'medium'; // min, small, medium, large;
const scrollLeft = getContext('scrollLeft');
const scrollTop = getContext('scrollTop');

</script>

{#if header}
  <th 
    colspan={colspan}
    class="data-table__header-cell data-cell--size-{size}" 
    class:data-cell--frozen={freezeX || freezeY} 
    class:data-cell--right-border={rightBorder}
    class:data-cell--left-border={leftBorder}
    class:data-cell--top-border={topBorder}
    class:data-cell--bottom-border={bottomBorder}
    class:data-cell--has-padding={padding}
    class:data-table__header-cell--has-padding={padding}
    class:data-table__header-cell--text={text}
    style="
      transform: translate({freezeX ? $scrollLeft : 0}px, {freezeY ? $scrollTop : 0}px);
    ">
    <slot></slot>
  </th>
{:else}
  <td
    colspan={colspan}
    class="data-cell data-cell--size-{size}" 
    class:data-cell--frozen={freezeX || freezeY}
    class:data-cell--right-border={rightBorder}
    class:data-cell--left-border={leftBorder}
    class:data-cell--top-border={topBorder}
    class:data-cell--bottom-border={bottomBorder}
    class:data-cell--has-padding={padding}
    style="transform: translate({freezeX ? $scrollLeft : 0}px, {freezeY ? $scrollTop : 0}px);">
    <slot></slot>
  </td  >
{/if}
