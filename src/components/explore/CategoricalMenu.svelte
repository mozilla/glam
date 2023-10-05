<script>
  import { OptionMenu, Option, OptionDivider } from '@graph-paper/optionmenu';

  import { store } from '../../state/store';

  import KeySelectionControl from '../controls/KeySelectionControl.svelte';
  import ColorSwatch from '../controls/ColorSwatch.svelte';

  import { numericStringsSort } from '../../utils/sort';
  import { numHighlightedBuckets } from '../../config/shared';

  export let data;
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
  let coloredBuckets = [];
  let everActiveBuckets = [];
  let sortedImportantBuckets = [];
  let sortedUnimportantBuckets = [];

  if (bucketOptions.length > numHighlightedBuckets) {
    showOptionMenu = true;
    const lastDataset = data[data.length - 1];

    coloredBuckets = Object.entries(lastDataset.counts)
      .sort(([bucketAName, bucketAValue], [bucketBName, bucketBValue]) => {
        const bucketValueDifference = bucketAValue - bucketBValue;
        if (bucketValueDifference === 0) {
          return bucketBName - bucketAName;
        }
        return bucketValueDifference;
      })
      .slice(-numHighlightedBuckets)
      .map(([bucket]) => bucket);
  }

  let selectAllCategories = false;

  $: if (showOptionMenu) {
    everActiveBuckets = [...new Set([...activeBuckets, ...everActiveBuckets])];

    // An important bucket is any bucket that:
    //
    //   (a) is colored
    //   (b) is currently active
    //   (c) has been active at some point in the past
    //
    // Rule (c) improves usability: if the user goes out of their way to enable a
    // bucket that we consider to be unimportant, we should consider it to be
    // important for the rest of the interaction. If we did not do this, the bucket
    // would switch between the important group and the unimportant group as it's
    // toggled, which would be annoying.
    sortedImportantBuckets = [
      ...new Set([...everActiveBuckets, ...coloredBuckets]),
    ].sort(numericStringsSort);

    // An unimportant bucket is any other bucket
    sortedUnimportantBuckets = bucketOptions
      .filter((bucket) => !sortedImportantBuckets.includes(bucket))
      .sort(numericStringsSort);
  }

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
      {#each sortedImportantBuckets as importantBucket, i (importantBucket)}
        <Option
          selected={activeBuckets.includes(importantBucket)}
          key={importantBucket}
          label={importantBucket}>
          <div class="option-menu__list-item__slot-right" slot="right">
            <ColorSwatch color={bucketColorMap(importantBucket)} />
          </div>
        </Option>
      {/each}
      {#if sortedImportantBuckets.length && sortedUnimportantBuckets.length}
        <OptionDivider />
      {/if}
      {#each sortedUnimportantBuckets as unimportantBucket, i (unimportantBucket)}
        <!--
                By definition, an unimportantBucket is never a selected bucket,
                hence selected={false}
              -->
        <Option
          selected={false}
          key={unimportantBucket}
          label={unimportantBucket}>
          <div slot="right">
            <ColorSwatch color={bucketColorMap(unimportantBucket)} />
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
