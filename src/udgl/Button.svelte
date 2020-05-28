<script>
  import { getContext } from 'svelte';
  import { tooltip as tooltipAction } from './utils/tooltip';

  export let level = 'high';
  export let tooltip;
  export let compact = false;

  export let toggled = false;

  export let size = compact ? 'compact' : 'standard';
  export let dark = getContext('appDarkMode') || false;
</script>

<style>
  button {
    --primary-color: var(--digital-blue-600);
    --primary-color-dark: var(--digital-blue-800);
    --primary-color-light: var(--digital-blue-400);
    --primary-color-lightest: var(--digital-blue-300);
    cursor: pointer;
    font-size: var(--button-text-size);
    text-transform: uppercase;
    border-radius: var(--border-radius-1h);
    padding: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    font-weight: 500;
    margin: 0;
    display: flex;
    column-gap: var(--space-base);
    text-align: center;
  }

  /* high emphasis, medium emphasis, low emphasis */

  .button--high {
    background-color: var(--primary-color);
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }

  .button--high:hover {
    box-shadow: var(--depth-small);
  }

  .button--high:active,
  .button--high.toggled {
    box-shadow: none;
    background-color: var(--primary-color-dark);
  }

  .button--medium {
    background-color: transparent;
    color: var(--primary-color);
  }

  .button--medium:hover,
  .button--low:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .button--medium:active,
  .button--medium.toggled,
  .button--low:active,
  .button--low.toggled {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .button--low {
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid transparent;
  }

  .dark.button--high {
    background-color: var(--primary-color-light);
    border-color: var(--primary-color-light);
    color: black;
  }

  .dark.button--high:hover {
    box-shadow: var(--depth-small);
  }

  .dark.button--high:active,
  .dark.button--high.toggled {
    box-shadow: none;
    background-color: var(--primary-color-lightest);
    border-color: var(--primary-color-lightest);
  }

  .dark.button--medium {
    background-color: transparent;
    color: var(--primary-color-light);
    border-color: var(--primary-color-light);
  }

  .dark.button--medium:hover,
  .dark.button--low:hover {
    background-color: var(--primary-color-dark);
  }

  .dark.button--medium:active,
  .dark.button--medium.toggled,
  .dark.button--low:active,
  .dark.button--low.toggled {
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--primary-color-lightest);
  }

  .dark.button--medium:active,
  .dark.button--medium.toggled {
    border-color: var(--primary-color-lightest);
  }

  .dark.button--low {
    background-color: transparent;
    color: var(--primary-color-light);
    border: 1px solid transparent;
  }

  /* I don't like how to select dark mode here. Yikes. */
  .button--compact,
  .dark.button--compact {
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-size: var(--button-text-size-compact);
    column-gap: var(--space-1h);
  }

  /* desaturate. */
  /* .button--high.button--pale {
    color: var(--digital-blue-pale);
    border: 1px solid var(--digital-blue-pale);
    background-color: 1px solid var(--digital-blue-pale);
}

.button--medium.button--pale {
    color: var(--digital-blue-pale);
    border: 1px solid var(--digital-blue-pale);
}

.button--low.button--pale {
    color: var(--digital-blue-pale);

} */
</style>

<button
  use:tooltipAction={{ text: tooltip }}
  class="button--{level} button--{size} button-text--{size}"
  class:dark
  class:toggled
  on:click>
  <slot />
</button>
