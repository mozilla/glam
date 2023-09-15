<script>
  import ProportionExplorerView from '../../../src/components/explore/ProportionExplorerView.svelte';
  import ENUMERATED_HISTOGRAM_BUILD_ID from './enumerated_histogram_build_id.json';
  import ENUMERATED_HISTOGRAM_VERSION from './enumerated_histogram_version.json';
  import BOOLEAN_HISTOGRAM_BUILD_ID from './boolean_histogram_build_id.json';
  import BOOLEAN_HISTOGRAM_VERSION from './boolean_histogram_version.json';

  import { firefoxVersionMarkers } from '../../../src/state/product-versions';
  import { transformAPIResponse } from '../../../src/utils/transform-data';
  import { extractBucketMetadata } from '../../../src/config/shared';

  const booleanHistogramBuildID = transformAPIResponse.proportion(
    BOOLEAN_HISTOGRAM_BUILD_ID.response,
    'build_id'
  );
  const booleanHistogramVersion = transformAPIResponse.proportion(
    BOOLEAN_HISTOGRAM_VERSION.response,
    'version'
  );

  const enumeratedHistogramBuildID = transformAPIResponse.proportion(
    ENUMERATED_HISTOGRAM_BUILD_ID.response,
    'build_id'
  );
  const enumeratedHistogramVersion = transformAPIResponse.proportion(
    ENUMERATED_HISTOGRAM_VERSION.response,
    'version'
  );

  let probes = [
    {
      name: 'Boolean Histogram',
      build_id: {
        data: booleanHistogramBuildID,
        ...extractBucketMetadata(booleanHistogramBuildID),
      },
      version: {
        data: booleanHistogramVersion,
        ...extractBucketMetadata(booleanHistogramVersion),
      },
      probeType: 'histogram-boolean',
    },
    {
      name: 'Enumerated Histogram',
      build_id: {
        data: enumeratedHistogramBuildID,
        ...extractBucketMetadata(enumeratedHistogramBuildID),
      },
      version: {
        data: enumeratedHistogramVersion,
        ...extractBucketMetadata(enumeratedHistogramVersion),
      },
      probeType: 'histogram-enumerated',
    },
  ];

  let which = 0;
  let aggregationOptions = [
    { name: 'By Build ID', key: 'build_id' },
    { name: 'By Version', key: 'version' },
  ];
  let aggregationLevel = 'build_id';

  let timeHorizon = 'MONTH';
  let metricType = 'proportions';
  let activeBuckets = probes[which][aggregationLevel].initialBuckets;
  $: activeBuckets = probes[which][aggregationLevel].initialBuckets;
  function handleSelection(event) {
    const { selection, type } = event.detail;
    if (type === 'timeHorizon') timeHorizon = selection;
    if (type === 'metricType') metricType = selection;
    if (type === 'activeBuckets') activeBuckets = selection;
  }
</script>

<style>
  .story {
    position: relative;
  }

  .explorer-view {
    margin: auto;
  }

  .view-header {
    display: grid;
    grid-template-columns: auto max-content max-content;
    font-family: var(--main-mono-font);
    border-bottom: 3px solid var(--cool-gray-200);
    margin-bottom: var(--space-4x);
    grid-column-gap: var(--space-2x);
  }

  .view-header h1 {
    font-weight: normal;
    margin: 0px;
  }

  .selectors {
    position: relative;
    width: max-content;
    font-size: var(--text-02);
    font-family: var(--main-mono-font);
    margin-bottom: var(--space-4x);
    padding: var(--space-4x);
    border-radius: var(--space-base);
    box-shadow: var(--depth-tiny);
    z-index: 1000;
    background-color: white;
    color: var(--blue-slate-600);
  }
</style>

<div class="story">
  <div style="width: 900px;" class="explorer-view">
    <div class="view-header">
      <h1>Proportion Explorer</h1>
      <div class="selectors">
        {#each aggregationOptions as { name, key }, i}
          <label>
            <input type="radio" bind:group={aggregationLevel} value={key} />
            {name}
          </label>
        {/each}
      </div>

      <div class="selectors">
        {#each probes as { name, data }, i}
          <label>
            <input type="radio" bind:group={which} value={i} />
            {name}
          </label>
        {/each}
      </div>
    </div>

    <h1 class="story__title">
      probe /
      <span class="probe-head">{probes[which].name}</span>
    </h1>
    {#each probes as probe, i (probe.name + probe.probeType + aggregationLevel)}
      {#if which === i}
        <ProportionExplorerView
          probeType={probe.probeType}
          data={probe[aggregationLevel].data}
          {timeHorizon}
          {metricType}
          {activeBuckets}
          on:selection={handleSelection}
          markers={$firefoxVersionMarkers}
          bucketOptions={probe[aggregationLevel].bucketOptions}
          bucketColorMap={probe[aggregationLevel].bucketColorMap}
          bucketSortOrder={probe[aggregationLevel].bucketSortOrder}
          {aggregationLevel}
        />
      {/if}
    {/each}
  </div>
</div>
