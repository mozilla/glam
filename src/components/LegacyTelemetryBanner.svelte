<script>
  import { store } from '../state/store';

  let mirrorMetric = '';
  $: if ($store.probe.name) {
    fetch(`/api/v1/legacy-mirror-metric/?probe=${$store.probe.name}`)
      .then((r) => r.json())
      .then((data) => {
        mirrorMetric = data.mirror;
      });
  }
</script>

<style>
  .legacy-banner {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: var(--space-2x);
    align-items: center;
    padding: var(--space-3x) var(--space-4x);
    margin-bottom: var(--space-2x);
    border-radius: var(--space-base);
    background: linear-gradient(
      90deg,
      var(--bright-yellow-100),
      var(--bright-yellow-150)
    );
    border: 1px solid var(--bright-yellow-500);
    color: var(--bright-yellow-700);
    box-shadow: var(--depth-small), 0 0 0 1px rgba(0, 0, 0, 0.02);
  }

  .legacy-banner__label {
    font-size: var(--text-015);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
    color: var(--bright-yellow-900);
    padding: var(--space-1h) var(--space-base);
    border-radius: var(--space-base);
    background-color: var(--bright-yellow-200);
    border: 1px solid var(--bright-yellow-450);
  }

  .legacy-banner__copy {
    margin: 0;
    font-size: var(--text-02);
    line-height: 1.5;
  }
</style>

<div class="legacy-banner">
  <div class="legacy-banner__label">Legacy Telemetry</div>
  {#if mirrorMetric}
    <p class="legacy-banner__copy">
      Legacy Telemetry is deprecated and data for this probe will be stale soon.
      Consider using
      <a
        href={`https://glam.telemetry.mozilla.org/fog/probe/${mirrorMetric}/explore`}
        target="_blank">the Glean version of this probe</a
      >
      instead.
    </p>
  {:else}
    <p class="legacy-banner__copy">
      Legacy Telemetry is deprecated and data for this probe will be stale soon.
    </p>
  {/if}
</div>
