<script>
  import { fly } from 'svelte/transition';
  import DataError from '../../components/errors/DataError.svelte';
  import ProbeTitle from '../../components/regions/ProbeTitle.svelte';
  import Spinner from '../../components/LineSegSpinner.svelte';
  import { dataset, store } from '../../state/store';
  import { isSelectedProcessValid } from '../../utils/probe-utils';
</script>

<style>
</style>

{#if $store.probe.loaded}
  {#await $dataset}
    <div class="graphic-body__content">
      <Spinner size={48} color={'var(--cool-gray-400)'} />
    </div>
  {:then data}
    {#if $store.product === 'firefox' && $store.probe.active === false}
      <div class="graphic-body__content">
        <ProbeTitle />
        <div in:fly={{ duration: 400, y: 10 }}>
          <DataError
            reason={'This probe is inactive and is no longer collecting data.'}
          />
        </div>
      </div>
    {:else if $store.product === 'firefox' && !isSelectedProcessValid($store.probe.seen_in_processes, $store.productDimensions.process)}
      <div class="graphic-body__content">
        <ProbeTitle />
        <div in:fly={{ duration: 400, y: 10 }}>
          <DataError
            reason={`This probe does not record in the ${$store.productDimensions.process} process.`}
          />
        </div>
      </div>
    {:else if data.level === 'INFO' && data.key === 'SELECT_LABEL'}
      <slot {data} probeType={data.viewType} needsLabelSelection={true} />
    {:else if data.level === 'INFO' && data.key === 'SELECT_SUB_LABEL'}
      <slot {data} probeType={data.viewType} needsSubLabelSelection={true} />
    {:else}
      <slot {data} probeType={data.viewType} />
    {/if}
  {:catch err}
    <div class="graphic-body__content">
      <ProbeTitle />
      <div in:fly={{ duration: 400, y: 10 }}>
        <DataError reason={err.message} moreInformation={err.moreInformation} />
      </div>
    </div>
  {/await}
{/if}
