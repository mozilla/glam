<script>
  import { fade } from 'svelte/transition';

  import Probe from '../../wrappers/Probe.svelte';
  import ProbeTableView from '../../../components/table/ProbeTableView.svelte';
  import { store } from '../../../state/store';
</script>

<Probe let:data let:probeType>
  <div class="graphic-body__content graphic-body__content--no-padding">
    <div in:fade>
      <!-- this conditional is a stopgap until we fix https://github.com/mozilla/glam/issues/206 -->
      {#if $store.probe.type}
        <ProbeTableView
          data={data.data}
          probeType={probeType}
          colorMap={data.bucketColorMap}
          visibleBuckets={[...$store.activeBuckets]}
          aggregationLevel={$store.aggregationLevel}>
          <h2 class="graphic-body__title--padding">
            table /
            <span>{$store.probe.name}</span>
          </h2>
        </ProbeTableView>
      {/if}
    </div>
  </div>
</Probe>
