<script>
  import { OptionMenu, Option } from '@graph-paper/optionmenu';

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

  // Simple function to sort all buckets
  function updateSortedBuckets() {
    if (showOptionMenu) {
      sortedAllBuckets = [...bucketOptions].sort(numericStringsSort);
    }
  }

  // Initial call to set up sorted buckets
  updateSortedBuckets();

  function handleToggleAllCategories() {
    // If all buckets are selected, deselect all; otherwise select all
    if ($store.activeBuckets.length === bucketOptions.length) {
      store.setField('activeBuckets', []);
    } else {
      store.setField('activeBuckets', bucketOptions);
    }
  }

  $: allBucketsSelected = $store.activeBuckets.length === bucketOptions.length;
</script>

<style>
  .select-all-button {
    border: none;
    width: 100%;
    font-family: var(--main-text-font);
    color: var(--digital-blue-600);
    font-weight: 500;
    font-size: 0.8em;
    padding: 0.5em;
    cursor: pointer;
  }

  .select-all-button:hover {
    background-color: var(--cool-gray-100);
  }
</style>

<div class="body-control-set">
  <label class="body-control-set--label">Categories</label>
  {#if showOptionMenu}
    <OptionMenu
      multi
      on:selection={(evt) => {
        store.setField('activeBuckets', evt.detail.keys);
      }}
    >
      <button class="select-all-button" on:click={handleToggleAllCategories}>
        SELECT ALL / NONE
      </button>
      {#each sortedAllBuckets as bucket, i (bucket)}
        <Option
          selected={activeBuckets.includes(bucket)}
          key={bucket}
          label={bucket}
        >
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
      colorMap={bucketColorMap}
    />
  {/if}
</div>
