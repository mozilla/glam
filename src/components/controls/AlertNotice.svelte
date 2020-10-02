<script>
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Cancel } from '@graph-paper/icons';

  // Required: Which localStorage key to check whether this notice has been dismissed.
  export let toggleKey = '';

  const today = new Date().getDate();

  // So we don't pollute the entire LS namespace.
  const KEY_PREFIX = 'alertNotice-';

  // Intentional loose (coerced) comparison.
  // This will fail if you continually visit on the same day of the month and that's fine.
  // eslint-disable-next-line eqeqeq
  let alertVisible =
    window.localStorage.getItem(KEY_PREFIX + toggleKey) != today; // eslint-disable-line eqeqeq

  function dismissNotice() {
    alertVisible = false;
    window.localStorage.setItem(KEY_PREFIX + toggleKey, today);
  }
</script>

<style>
  .alert-notice {
    position: fixed;
    left: var(--space-6x);
    bottom: var(--space-6x);
    border: var(--alert-notice-border);
    background-color: var(--alert-notice-background);
    color: var(--alert-notice-text-color);
    border-radius: var(--border-radius-base);
    padding: var(--alert-notice-item-padding);
    box-shadow: var(--depth-small);
    z-index: 10;
  }

  .alert-notice-content {
    line-height: 1.5;
    font-size: var(--text-015);
    width: 400px;
  }

  .alert-notice-content > * {
    margin: 0;
  }

  .alert-notice-action {
    position: absolute;
    right: var(--space-1h);
    top: var(--space-1h);
    padding: var(--space-1h); /* makes the click target a bit larger */
    cursor: pointer;
    border-radius: 50%;
  }

  .alert-notice-action button {
    background-color: transparent;
    border: 0;
    border-radius: var(--border-radius-base);
    font-size: var(--text-01);
    margin: 0;
    cursor: pointer;
    color: var(--bright-yellow-700);
  }

  .alert-notice-action:hover button {
    color: var(--bright-yellow-600);
  }
</style>

{#if alertVisible}
  <div
    class="alert-notice"
    transition:fly={{ y: 10, duration: 200, easing: cubicOut }}>
    <div class="alert-notice-content">
      <slot />
    </div>
    <div class="alert-notice-action" on:click={dismissNotice}>
      <button><Cancel size={24} /></button>
    </div>
  </div>
{/if}
