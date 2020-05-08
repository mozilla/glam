<script>
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let dismissText = 'dismiss'; // Label of 'dismiss' button.
  // Required: Which localStorage key to check whether this notice has been dismissed.
  export let toggleKey = '';

  const today = new Date().getDate();

  // So we don't pollute the entire LS namespace.
  const KEY_PREFIX = 'alertNotice-';

  // Intentional loose (coerced) comparison.
  // This will fail if you continually visit on the same day of the month and that's fine.
  let alertVisible = window.localStorage.getItem(KEY_PREFIX + toggleKey) != today;

  function dismissNotice() {
    alertVisible = false;
    window.localStorage.setItem(KEY_PREFIX + toggleKey, today);
  }
</script>

<style>
  .alert-notice {
    position: absolute;
    left: var(--space-4x);
    bottom: var(--space-4x);
    border: 1px solid var(--bright-yellow-500);
    display: flex;
    background-color: var(--bright-yellow-100);
    color: var(--bright-yellow-700);
    border-radius: var(--border-radius-base);
    padding: var(--space-2x);
    align-items: center;
    grid-gap: var(--space-3x);
  }

  .alert-notice-content {
    line-height: 1.5;
    font-size: var(--text-015);
    width: 350px;
  }

  .alert-notice-content > * {
    margin: 0;
  }

  .alert-notice-action button {
    padding: var(--space-base);
    border: 1px solid var(--bright-yellow-500);
    background-color: var(--bright-yellow-150);
    text-transform: uppercase;
    border-radius: var(--border-radius-base);
    font-size: var(--text-01);
    color: var(--bright-yellow-700);
    margin: 0;
    cursor: pointer;
  }

  .alert-notice-action button:hover {
    background-color: var(--bright-yellow-200);
    color: var(--bright-yellow-750);
  }
</style>

{#if alertVisible}
  <div class="alert-notice" transition:fade={{ easing: cubicOut }}>
    <div class="alert-notice-content">
      <slot></slot>
    </div>
    <div class="alert-notice-action">
      <button on:click={dismissNotice}>{dismissText}</button>
    </div>
  </div>
{/if}
