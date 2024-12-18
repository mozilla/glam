<script>
  import { fade } from 'svelte/transition';

  import Probe from '../../wrappers/Probe.svelte';
  import ProportionExplorerView from '../../../components/explore/ProportionExplorerView.svelte';
  import QuantileExplorerView from '../../../components/explore/QuantileExplorerView.svelte';
  import ProbeTitle from '../../../components/regions/ProbeTitle.svelte';
  import Spinner from '../../../components/LineSegSpinner.svelte';
  import { store } from '../../../state/store';

  function handleBodySelectors(event) {
    const { selection, type } = event.detail;
    const renames = {
      percentiles: 'visiblePercentiles',
      metricType: 'proportionMetricType',
    };

    const field = renames[type] || type;
    // FIXME: use the productConfig from an upcoming PR.
    if (field === 'aggregationLevel') {
      store.setDimension(field, selection);
    } else {
      store.setField(field, selection);
    }
  }
  // Here's a harmless comment that will tell me if stuff is going to prod just by merging onto main
</script>

<Probe let:data let:probeType>
  <div in:fade class="graphic-body__content">
    {#if probeType === 'categorical'}
      <ProportionExplorerView
        data={data.data}
        metricType={$store.proportionMetricType}
        activeBuckets={[...$store.activeBuckets]}
        timeHorizon={$store.timeHorizon}
        bucketOptions={data.bucketOptions}
        bucketColorMap={data.bucketColorMap}
        bucketSortOrder={data.bucketSortOrder}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.productDimensions.aggregationLevel}
      >
        <ProbeTitle />
      </ProportionExplorerView>
    {:else if ['log', 'linear'].includes(probeType)}
      <QuantileExplorerView
        data={data.data}
        {probeType}
        timeHorizon={$store.timeHorizon}
        percentiles={$store.visiblePercentiles}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.productDimensions.aggregationLevel}
      >
        <ProbeTitle />
      </QuantileExplorerView>
    {:else}
      <div class="graphic-body__content">
        <div style="width: 100%">
          <Spinner size={48} color={'var(--cool-gray-400)'} />
        </div>
      </div>
    {/if}
  </div>
</Probe>
