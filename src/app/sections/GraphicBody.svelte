<script>
  import { fade } from "svelte/transition";

  // FIXME: get rid of this once the API / dataset is fixed.
  // until then, we will need to keep this, since it's our only
  // way of reading from the probe info service, which has the
  // accurate probe information.
  import { derived } from "svelte/store";

  import { store, dataset, extractBucketMetadata } from "../state/store";

  import { getProbeViewType } from "../utils/probe-utils";

  import ProbeDetails from "./ProbeDetails.svelte";

  import QuantileExplorerView from "../patterns/body/quantiles/QuantileExplorerView.svelte";
  import ProportionExplorerView from "../patterns/body/proportions/ProportionExplorerView.svelte";

  import { firefoxVersionMarkers } from "../state/product-versions";

  // const getProbeViewType = (probeType, probeKind) => {
  //   if (probeType === 'histogram' && probeKind === 'enumerated') return 'categorical';
  //   if (isCategorical(probeType, probeKind)) return 'categorical';
  //   if (probeType === 'histogram' && ['linear', 'exponential'].includes(probeKind)) return 'histogram';
  //   if (probeType === 'scalar' && probeKind === 'uint') return 'scalar';
  //   return undefined;
  // };

  let probeName;
  let output = Promise.resolve({});
  // FIXME: for now, once we have retreived the data set, there are
  // a few additional operations that need to be performed.
  // to start, we will need to reset the activeBuckets in the non-
  // initializing case.

  // down the line, it would be good to figure out the right way to think
  // about this whole pipeline. At the moment it does feel kind of weird to
  // have the post-fetching step be in a component.

  // ADDL FIXME: we should wait for the telemetry probes to load if that's what we're
  // looking for here.

  const temporaryViewTypeStore = derived(store, $st =>
    getProbeViewType($st.probe.type, $st.probe.kind)
  );

  $: if (
    $store.probe.name !== probeName &&
    $dataset.data &&
    $temporaryViewTypeStore
  ) {
    probeName = $store.probe.name;
    output = $dataset.data
      .then(
        // ({ data, probeType, probeKind }) => {
        ({ data }) => {
          const viewType = $temporaryViewTypeStore; // getProbeViewType(probeType, probeKind); // FIXME!!!
          const isCategorical = viewType === "categorical";
          // const isCategoricalData = isCategorical(probeType, probeKind);
          let etc = {};
          if (isCategorical) {
            etc = extractBucketMetadata(data);
            if ($store.applicationStatus !== "INITIALIZING") {
              store.setField("activeBuckets", etc.initialBuckets);
            }
          }
          store.setField("applicationStatus", "ACTIVE");
          return { data, viewType, ...etc };
        }
      )
      .catch(err => console.error(err));
  }

  // FIXME: remove this once the dataset + API are fixed.

  let container;
  let width;

  function handleBodySelectors(event) {
    const { selection, type } = event.detail;
    if (type === "percentiles") store.setField("visiblePercentiles", selection);
    if (type === "timeHorizon") store.setField("timeHorizon", selection);
    if (type === "metricType")
      store.setField("proportionMetricType", selection);
    if (type === "activeBuckets") {
      store.setField("activeBuckets", selection);
    }
  }
</script>

<style>
  .graphic-body-container {
    display: grid;
    grid-template-columns: auto min-content;
    grid-template-rows: auto auto;
    grid-template-areas:
      "header header"
      "content-body right";
    align-items: stretch;
    justify-items: stretch;
    background-color: white;
    --height: calc(100vh - var(--header-height) * 2);
  }

  .graphic-body__graphic-header {
    grid-area: header;
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    align-items: start;
    background-color: var(--cool-gray-100);
  }

  .graphic-body__graphic-header h2 {
    margin: 0;
    padding: 0;
    width: 100%;
    word-break: break-all;
    height: var(--increment);
    display: grid;
    align-items: center;
    padding-left: var(--space-4x);
  }

  .graphic-body__content {
    box-sizing: border-box;
    grid-area: content-body;
    overflow-y: auto;
    height: var(--height);
    background-color: white;
    padding: var(--space-4x);
    padding-top: var(--space-2x);
  }

  .graphic-body__details {
    grid-area: right;
    height: var(--height);
  }
</style>

<svelte:window bind:innerWidth={width} />

<div bind:this={container} class="graphic-body-container">

  <div class="graphic-body__graphic-header">
    {#if $store.probe.name}
      <h2 class="heading--03">{$store.probe.name}</h2>
    {:else}
      <h2 class="heading--04">Telemetry Prototype</h2>
    {/if}
  </div>

  <div class="graphic-body__content">
    {#if $dataset.key === 'DEFAULT_VIEW'}
      <div>Telemetry dashboard default view goes here</div>
    {:else if $dataset.data}
      {#await output}
        running query
      {:then data}
        <div in:fade>
          {#if $temporaryViewTypeStore === 'categorical'}
            <ProportionExplorerView
              markers={$firefoxVersionMarkers}
              data={data.data}
              probeType={`${$store.probe.type}-${$store.probe.kind}`}
              metricType={$store.proportionMetricType}
              activeBuckets={[...$store.activeBuckets]}
              timeHorizon={$store.timeHorizon}
              bucketOptions={data.bucketOptions}
              bucketColorMap={data.bucketColorMap}
              bucketSortOrder={data.bucketSortOrder}
              on:selection={handleBodySelectors} />
          {:else if ['histogram', 'scalar'].includes($temporaryViewTypeStore)}
            <QuantileExplorerView
              markers={$firefoxVersionMarkers}
              data={data.data}
              probeType={$temporaryViewTypeStore}
              timeHorizon={$store.timeHorizon}
              percentiles={$store.visiblePercentiles}
              on:selection={handleBodySelectors} />
          {:else}
            <div style="width: 100%">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          {/if}
        </div>
      {:catch err}
        An error was caught: {err}
      {/await}
    {:else}
      <div>{$dataset.key}</div>
    {/if}

  </div>
  <div class="graphic-body__details">
    <ProbeDetails />
  </div>
</div>
