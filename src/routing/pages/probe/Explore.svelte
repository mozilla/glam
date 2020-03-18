<script>
  import Spinner from 'udgl/LineSegSpinner.svelte';
  import { fade } from 'svelte/transition';

  import Probe from '../../wrappers/Probe.svelte';
  import ProportionExplorerView from '../../../components/explore/ProportionExplorerView.svelte';
  import QuantileExplorerView from '../../../components/explore/QuantileExplorerView.svelte';
  import ProbeTitle from '../../../components/regions/ProbeTitle.svelte';  
  import { store } from '../../../state/store';


  function handleBodySelectors(event) {
    const { selection, type } = event.detail;
    const renames = {
      percentiles: 'visiblePercentiles',
      metricType: 'proportionMetricType',
    };
    const field = renames[type] || type;
    store.setField(field, selection);
  }
</script>

<Probe let:data let:probeType>
  <div in:fade class="graphic-body__content">
    <ProbeTitle view={$store.route.view} probeName={$store.probe.name} />
    {#if probeType === 'categorical'}
      <ProportionExplorerView
        data={data.data}
        probeType={`${$store.probe.type}-${$store.probe.kind}`}
        metricType={$store.proportionMetricType}
        activeBuckets={[...$store.activeBuckets]}
        timeHorizon={$store.timeHorizon}
        bucketOptions={data.bucketOptions}
        bucketColorMap={data.bucketColorMap}
        bucketSortOrder={data.bucketSortOrder}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.aggregationLevel}
      />  
    {:else if ['histogram', 'scalar'].includes(probeType)}
      <QuantileExplorerView
        data={data.data}
        probeType={probeType}
        timeHorizon={$store.timeHorizon}
        percentiles={$store.visiblePercentiles}
        on:selection={handleBodySelectors}
        aggregationLevel={$store.aggregationLevel}
      />
    {:else}
      <div class="graphic-body__content">
        <div style="width: 100%">
          <Spinner size={48} color={'var(--cool-gray-400)'} />
        </div>
      </div>
    {/if}
  </div>
</Probe>
