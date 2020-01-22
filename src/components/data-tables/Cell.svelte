<script>
import { getContext } from 'svelte';
import { tooltip as tooltipAction } from '../utils/tooltip'

export let header = getContext('header') || false;
export let freezeX = false;
export let freezeY = false;
export let rightBorder = false;
export let leftBorder = false;
export let topBorder = false;
export let bottomBorder = header ? true : false;
export let padding = true;
export let text = false;
export let align = undefined;
export let colspan = 1;
export let tooltip;

export let borderColor = undefined;
export let borderThickness = undefined;
export let bottomBorderColor = borderColor;
export let bottomBorderThickness = borderThickness;
export let topBorderColor = borderColor;
export let topBorderThickness = borderThickness;

export let size = 'medium'; // min, small, medium, large;
const scrollLeft = getContext('scrollLeft');
const scrollTop = getContext('scrollTop');

</script>

{#if header}
  <th 
    colspan={colspan}
    class="
      data-cell
      data-cell--header
      data-cell--size-{size}
      data-cell--align-{align}" 
    class:data-cell--frozen={freezeX || freezeY} 
    class:data-cell--right-border={rightBorder}
    class:data-cell--left-border={leftBorder}
    class:data-cell--top-border={topBorder}
    class:data-cell--bottom-border={bottomBorder}
    class:data-cell--has-padding={padding}
    class:data-cell--header--has-padding={padding}
    class:data-cell--header--text={text}
    use:tooltipAction={tooltip}
    
    style="
      transform: translate({freezeX ? $scrollLeft : 0}px, {freezeY ? $scrollTop : 0}px);
      --bottom-border-color: {bottomBorderColor  || "var(--border-color)"};
      --bottom-border-thickness: {bottomBorderThickness || "var(--border-thickness)"};
      --top-border-color: {topBorderColor  || "var(--border-color)"};
      --top-border-thickness: {topBorderThickness || "var(--border-thickness)"};
    ">
    <slot></slot>
  </th>
{:else}
  <td
    colspan={colspan}
    class="
      data-cell 
      data-cell--size-{size}
      data-cell--align-{align}
    " 
    class:data-cell--frozen={freezeX || freezeY}
    class:data-cell--right-border={rightBorder}
    class:data-cell--left-border={leftBorder}
    class:data-cell--top-border={topBorder}
    class:data-cell--bottom-border={bottomBorder}
    class:data-cell--has-padding={padding}
    style="
      transform: translate({freezeX ? $scrollLeft : 0}px, {freezeY ? $scrollTop : 0}px);
    "
    use:tooltipAction={tooltip}
    >
    <slot></slot>
  </td  >
{/if}
