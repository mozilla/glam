<script>
  import { fly } from 'svelte/transition';
  import DataError from '../../components/errors/DataError.svelte';
  import ProbeTitle from '../../components/regions/ProbeTitle.svelte';
  import ProbeKeySelector from '../../components/controls/ProbeKeySelector.svelte';
  import Spinner from '../../components/LineSegSpinner.svelte';
  import { dataset, store } from '../../state/store';
  import { isSelectedProcessValid } from '../../utils/probe-utils';

  const PICK_ANOTHER_LABEL =
    'Some labels of a labeled metric have no data. Try picking a different label above.';
  $: labelKeys =
    $store.probeKeysFor === $store.probeName && $store.probeKeys
      ? [...$store.probeKeys]
      : [];
  $: showLabelSelector = labelKeys.length > 1;
  $: currentKey = labelKeys.includes($store.aggKey)
    ? $store.aggKey
    : labelKeys[0];

  function moreInformationFor(err, withLabelSelector) {
    if (!withLabelSelector || !err.noData) return err.moreInformation;
    return err.moreInformation
      ? `${err.moreInformation} ${PICK_ANOTHER_LABEL}`
      : PICK_ANOTHER_LABEL;
  }
</script>

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
    {:else}
      <slot {data} probeType={data.viewType} />
    {/if}
  {:catch err}
    <div class="graphic-body__content">
      <ProbeTitle />
      {#if showLabelSelector}
        <div class="body-control-row">
          <div class="body-control-set">
            <label class="body-control-set--label">Label</label>
            <ProbeKeySelector options={labelKeys} bind:currentKey />
          </div>
        </div>
      {/if}
      <div in:fly={{ duration: 400, y: 10 }}>
        <DataError
          reason={err.message}
          moreInformation={moreInformationFor(err, showLabelSelector)}
          link={err.link}
        />
      </div>
    </div>
  {/await}
{/if}
