<script>
import { getContext } from 'svelte';
import { tooltip as tooltipAction } from '../utils/tooltip';

export let header = getContext('header') || false;
export let freezeX = false;
export let freezeY = false;
export let rightBorder = false;
export let leftBorder = false;
export let topBorder = false;
export let bottomBorder = !!header;
export let padding = true;
export let text = false;
export let align;
export let colspan = 1;
export let tooltip;

export let borderColor;
export let borderThickness;
export let bottomBorderColor = borderColor;
export let bottomBorderThickness = borderThickness;
export let topBorderColor = borderColor;
export let topBorderThickness = borderThickness;
export let leftBorderColor = borderColor;
export let leftBorderThickness = borderThickness;
export let rightBorderColor = borderColor;
export let rightBorderThickness = borderThickness;

export let backgroundColor = 'transparent';


export let size = 'medium'; // min, small, medium, large;
const scrollLeft = getContext('scrollLeft');
const scrollTop = getContext('scrollTop');

</script>

<style>
  .data-cell {
    font-size: var(--text-015);
    text-align: right;
    --border-thickness: 1px;
    --left-border-thickness: var(--border-thickness);
    --top-border-thickness: var(--border-thickness);
    --right-border-thickness: var(--border-thickness);
    --bottom-border-thickness: var(--border-thickness);

    --border-color: var(--cool-gray-200);
    --left-border-color: var(--border-color);
    --right-border-color: var(--border-color);
    --top-border-color: var(--border-color);
    --bottom-border-color: var(--border-color);

    --default-background-color: transparent;
  }

  td:first-child {
    text-align: left;
  }

  .data-cell--header {
    --default-background-color: white;
    text-align: right;
    vertical-align: end;
    font-size: var(--text-015);
    text-transform: uppercase;
    font-weight: 600;
    color: var(--cool-gray-600);
  }

  .data-cell--header:first-child {
    text-align: left;
  }

  .data-cell--align-left {
    text-align: left;
  }

  .data-cell--align-right {
    text-align: right;
  }

  .data-cell--align-center {
    text-align: center;
  }

  .data-cell--header--has-padding {
    padding-top: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
  }

  .data-cell--header-cell--text {
    padding-bottom: var(--space-base);
  }

  .data-cell--header-cell--percentile {
    padding-left: var(--space-base);
    padding-right: var(--space-base);
  }

  .data-cell--has-padding {
    padding: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
  }

  .data-cell--size-min {
    min-width: 0;
  }

  .data-cell--size-tiny {
    min-width: var(--space-4x);
  }

  .data-cell--size-small {
    min-width: var(--space-6x);
  }

  .data-cell--size-medium {
    min-width: var(--space-12x);
  }

  .data-cell--size-large {
    min-width: var(--space-24x);
  }

  .data-cell--size-max {
    min-width: 100%;
  }

  .data-cell--right-border {
    border-right: var(--right-border-thickness) solid var(--right-border-color);
  }

  .data-cell--left-border {
    border-left: var(--left-border-thickness) solid var(--left-border-color);
  }

  .data-cell--top-border {
    border-top: var(--top-border-thickness) solid var(--top-border-color);
  }

  .data-cell--bottom-border {
    border-bottom: var(--bottom-border-thickness) solid var(--bottom-border-color);
  }

  .data-cell--frozen {
    background-color: white;
    z-index: 9;
  }

  td.data-cell--secondary {
    border-right: 2px solid var(--cool-gray-200);
    min-width: var(--space-12x);
  }
</style>

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
    use:tooltipAction={{ text: tooltip }}

    style="
      transform: translate({freezeX ? $scrollLeft : 0}px, {freezeY ? $scrollTop : 0}px);
      --bottom-border-color: {bottomBorderColor || "var(--border-color)"};
      --bottom-border-thickness: {bottomBorderThickness || "var(--border-thickness)"};
      --top-border-color: {topBorderColor || "var(--border-color)"};
      --top-border-thickness: {topBorderThickness || "var(--border-thickness)"};
      --left-border-color: {leftBorderColor || "var(--border-color)"};
      --left-border-thickness: {leftBorderThickness || "var(--border-thickness)"};
      --right-border-color: {rightBorderColor || "var(--border-color)"};
      --right-border-thickness: {rightBorderThickness || "var(--border-thickness)"};
      background-color: {backgroundColor || "var(--default-background-color)"};
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
      --bottom-border-color: {bottomBorderColor || "var(--border-color)"};
      --bottom-border-thickness: {bottomBorderThickness || "var(--border-thickness)"};
      --top-border-color: {topBorderColor || "var(--border-color)"};
      --top-border-thickness: {topBorderThickness || "var(--border-thickness)"};
      --left-border-color: {leftBorderColor || "var(--border-color)"};
      --left-border-thickness: {leftBorderThickness || "var(--border-thickness)"};
      --right-border-color: {rightBorderColor || "var(--border-color)"};
      --right-border-thickness: {rightBorderThickness || "var(--border-thickness)"};
      background-color: {backgroundColor || "var(--default-background-color)"};
    "
    use:tooltipAction={{ text: tooltip }}
    >
    <slot></slot>
  </td  >
{/if}
