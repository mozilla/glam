<script>
  import Spinner from 'udgl/LineSegSpinner.svelte';
  import { fly } from 'svelte/transition';

  // FIXME: get rid of this once the API / dataset is fixed.
  // until then, we will need to keep this, since it's our only
  // way of reading from the probe info service, which has the
  // accurate probe information.
  import { derived } from 'svelte/store';

  import DataError from '../../components/errors/DataError.svelte';
  import ProbeTitle from '../../components/regions/ProbeTitle.svelte';
  import { probe, dataset, store } from '../../state/store';
  import { getProbeViewType, isSelectedProcessValid } from '../../utils/probe-utils';


  // FIXME: for now, once we have retreived the data set, there are
  // a few additional operations that need to be performed.
  // to start, we will need to reset the activeBuckets in the non-
  // initializing case.

  // down the line, it would be good to figure out the right way to think
  // about this whole pipeline. At the moment it does feel kind of weird to
  // have the post-fetching step be in a component.

  // ADDL FIXME: we should wait for the telemetry probes to load if that's what we're
  // looking for here.

  const temporaryViewTypeStore = derived(probe, ($probe) => {
    if (!$probe) return undefined;
    return getProbeViewType(
      $probe.type,
      $probe.kind,
    );
  });
</script>

{#await $dataset}
  <div class="graphic-body__content">
    <Spinner size={48} color={'var(--cool-gray-400)'} />
  </div>
{:then data}
  {#if isSelectedProcessValid($store.recordedInProcesses, $store.productDimensions.process)}
    <slot {data} probeType={$temporaryViewTypeStore} />
  {:else}
    <DataError reason={`This probe does not record in the ${$store.productDimensions.process} process.`} />
  {/if}
{:catch err}
  <div class="graphic-body__content">
    <ProbeTitle />
    <div in:fly={{ duration: 400, y: 10 }}>
      <DataError reason={err.message} moreInformation={err.moreInformation} statusCode={err.statusCode} />
    </div>
  </div>
{/await}
