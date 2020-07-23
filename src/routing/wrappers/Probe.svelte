<script>
  import Spinner from 'udgl/LineSegSpinner.svelte';
  import { fly } from 'svelte/transition';
  import DataError from '../../components/errors/DataError.svelte';
  import ProbeTitle from '../../components/regions/ProbeTitle.svelte';
  import { dataset, store } from '../../state/store';
  import { isSelectedProcessValid } from '../../utils/probe-utils';

</script>

{#await $dataset}
  <div class="graphic-body__content">
    <Spinner size={48} color={'var(--cool-gray-400)'} />
  </div>
{:then data}
  {#if isSelectedProcessValid($store.recordedInProcesses, $store.productDimensions.process)}
    <slot {data} probeType={data.viewType} />
  {:else}
    <div class='graphic-body__content'>
      <ProbeTitle />
      <div in:fly={{ duration: 400, y: 10 }}>
        <DataError reason={`This probe does not record in the ${$store.productDimensions.process} process.`} />
      </div>
    </div>
  {/if}
{:catch err}
  <div class="graphic-body__content">
    <ProbeTitle />
    <div in:fly={{ duration: 400, y: 10 }}>
      <DataError reason={err.message} moreInformation={err.moreInformation} statusCode={err.statusCode} />
    </div>
  </div>
{/await}
