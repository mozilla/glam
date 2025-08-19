<script>
  import ProbeKeySelector from '../controls/ProbeKeySelector.svelte';
  import { store, processedMetricKeys, metricKeys } from '../../state/store';
  import { getDualLabeledSubKeys } from '../../utils/probe-utils';

  export let data; // The SELECT_LABEL or SELECT_SUB_LABEL data from the store

  $: isDualLabeled =
    $store.probe && $store.probe.type === 'dual_labeled_counter';
  $: isLabeledMetric =
    $store.probe && $store.probe.type && $store.probe.type.includes('labeled');
  $: showMainKeySelector =
    isLabeledMetric && $processedMetricKeys && $processedMetricKeys.length > 0;

  // Compute sub-keys locally based on selected main key
  $: localSubMetricKeys =
    isDualLabeled && selectedMetricKey && $metricKeys
      ? getDualLabeledSubKeys($metricKeys, selectedMetricKey)
      : [];

  $: showSubKeySelector =
    isDualLabeled &&
    selectedMetricKey &&
    localSubMetricKeys &&
    localSubMetricKeys.length > 0;

  // Local state for dropdown active states
  let mainKeyActive = false;
  let subKeyActive = false;

  // Local state for URL parameters (don't update store until GO is clicked)
  let selectedMetricKey = $store.metricKey || '';
  let selectedSubMetricKey = $store.subMetricKey || '';

  // Clear sub-key when main key changes
  $: if (selectedMetricKey) {
    // Only clear if the current sub-key is not valid for the new main key
    if (
      selectedSubMetricKey &&
      localSubMetricKeys &&
      !localSubMetricKeys.includes(selectedSubMetricKey)
    ) {
      selectedSubMetricKey = '';
    }
  } else {
    selectedSubMetricKey = '';
  }

  // Check if we have valid selections to enable GO button
  $: canNavigate = !!(
    selectedMetricKey &&
    (!isDualLabeled || selectedSubMetricKey)
  );

  function handleGoClick() {
    // Build the new URL with updated query parameters
    const url = new URL(window.location);

    if (selectedMetricKey) {
      url.searchParams.set('metricKey', selectedMetricKey);
    }

    if (isDualLabeled && selectedSubMetricKey) {
      url.searchParams.set('subMetricKey', selectedSubMetricKey);
    }

    // Navigate to the new URL
    window.location.href = url.toString();
  }
</script>

<style>
  .key-selector-container {
    border-radius: var(--space-2x);
    overflow: scroll;
    height: max-content;
  }

  .selectors-row {
    display: flex;
    align-items: center;
    gap: var(--space-4x);
    margin: var(--space-4x) 0;
    flex-wrap: wrap;
    overflow: visible;
  }

  .selector-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2x);
    overflow: visible;
    position: relative;
  }

  .selector-label {
    font-weight: 600;
    color: var(--cool-gray-700);
    font-size: var(--text-02);
  }

  .go-button-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-top: auto;
  }

  .go-button {
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
    color: white;
    text-decoration: none;
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--cool-gray-200);
  }

  .go-button:hover:not(:disabled) {
    background-color: var(--blue-600);
  }

  .go-button:disabled {
    background-color: var(--cool-gray-300);
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>

<div class="key-selector-container">
  <slot />
  <div class="selectors-row">
    {#if showMainKeySelector}
      <div class="selector-group">
        {#if isDualLabeled}
          <div class="selector-label">Key</div>
        {:else}
          <div class="selector-label">Label</div>
        {/if}
        <ProbeKeySelector
          options={$processedMetricKeys}
          currentKey={selectedMetricKey}
          bind:active={mainKeyActive}
          tooltipText="Select a value for this labeled metric"
          disableStoreUpdate={true}
          on:selection={(e) => (selectedMetricKey = e.detail.key)}
        />
      </div>
    {/if}

    {#if showSubKeySelector}
      <div class="selector-group">
        <div class="selector-label">Category</div>
        <ProbeKeySelector
          options={localSubMetricKeys}
          currentKey={selectedSubMetricKey}
          bind:active={subKeyActive}
          tooltipText="Select a category for this dual labeled counter"
          fieldName="subMetricKey"
          disableStoreUpdate={true}
          on:selection={(e) => (selectedSubMetricKey = e.detail.key)}
        />
      </div>
    {/if}
    <div class="go-button-container">
      <button
        class="go-button"
        disabled={!canNavigate}
        on:click={handleGoClick}
      >
        Apply
      </button>
    </div>
  </div>
</div>
