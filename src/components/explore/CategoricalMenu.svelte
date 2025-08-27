<script>
  import { OptionMenu, Option, OptionDivider } from '@graph-paper/optionmenu';

  import { store } from '../../state/store';

  import KeySelectionControl from '../controls/KeySelectionControl.svelte';
  import ColorSwatch from '../controls/ColorSwatch.svelte';

  import { numericStringsSort } from '../../utils/sort';
  import { numHighlightedBuckets } from '../../config/shared';

  export let activeBuckets;
  export let bucketColorMap;
  export let bucketOptions;

  export let bucketSortOrder = (a, b) => (a < b ? 1 : -1);

  function makeSelection() {
    return function onSelection(event) {
      store.setField('activeBuckets', event.detail.selection);
    };
  }

  let showOptionMenu = false;
  let sortedAllBuckets = [];

  if (bucketOptions.length > numHighlightedBuckets) {
    showOptionMenu = true;
  }

  let selectAllCategories = false;

  // Simple function to sort all buckets
  function updateSortedBuckets() {
    if (showOptionMenu) {
      sortedAllBuckets = [...bucketOptions].sort(numericStringsSort);
    }
  }

  // Initial call to set up sorted buckets
  updateSortedBuckets();

  function handleSelectAllCategories() {
    store.setField('activeBuckets', bucketOptions);
  }

  $: selectAllCategories = $store.activeBuckets.length === bucketOptions.length;
</script>

<style>
  .body-content {
    margin-top: var(--space-2x);
  }

  .data-graphics {
    margin-top: var(--space-4x);
  }

  .small-multiple {
    margin-bottom: var(--space-8x);
  }

  .select-all-button {
    border: none;
    width: 100%;
    font-family: var(--main-text-font);
    color: var(--digital-blue-600);
    font-weight: 500;
    font-size: 0.8em;
    padding: 0.5em;
  }

  .inactive {
    color: var(--cool-gray-350);
  }
</style>

<div class="body-control-set">
  <label class="body-control-set--label">Categories</label>
  {#if showOptionMenu}
    <OptionMenu
      multi
      on:selection={(evt) => {
        store.setField('activeBuckets', evt.detail.keys);
      }}>
      <button
        class="select-all-button {$store.activeBuckets.length ===
          bucketOptions.length && 'inactive'}"
        disabled={$store.activeBuckets.length === bucketOptions.length}
        on:click={handleSelectAllCategories}>
        SELECT ALL
      </button>
      {#each sortedAllBuckets as bucket, i (bucket)}
        <Option
          selected={activeBuckets.includes(bucket)}
          key={bucket}
          label={bucket}>
          <div slot="right">
            <ColorSwatch color={bucketColorMap(bucket)} />
          </div>
        </Option>
      {/each}
    </OptionMenu>
  {:else}
    <KeySelectionControl
      sortFunction={bucketSortOrder}
      options={bucketOptions}
      selections={activeBuckets}
      on:selection={makeSelection()}
      colorMap={bucketColorMap} />
  {/if}
</div>
