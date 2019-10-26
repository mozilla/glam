<script>
import QuantileExplorerView from '../../../src/app/patterns/body/quantiles/QuantileExplorerView.svelte';
import NAV_URL from '../../../tests/data/browser_engagement_navigation_urlbar_build_id.json';
import ACTIVE_TICKS from '../../../tests/data/browser_engagement_active_ticks_build_id.json';
import GCMS from '../../../tests/data/gc_ms_build_id.json';

// tests/data/browser_engagement_navigation_urlbar_build_id.json
// const gcmsByVersion = GCMS_BY_VERSION.response;
const navUrl = NAV_URL.response;
const gcms = GCMS.response;
const activeTicks = ACTIVE_TICKS.response;
let which = 0;
let probes = [

  {
    name: 'browser_engagement_active_ticks',
    data: activeTicks,
    probeType: 'scalar',
  }, {
    name: 'gc_ms',
    data: gcms,
    probeType: 'histogram',
  },

  {
    name: 'browser_engagement_navigation_urlbar',
    data: navUrl,
    probeType: 'scalar',
  },
];

</script>

    <div class=story>
      <div style="width: 900px;">
        <h1 class="story__title">probe / <span class=probe-head>{probes[which].name}</span></h1>
        {#each probes as {name, data}, i}
          <label>
            <input type=radio bind:group={which} value={i}>
            {name} ({data.length})
          </label>
        {/each}
        {#each probes as probe, i (probe.name)}
          {#if which === i}
            <QuantileExplorerView 
              probeType={probe.probeType}
              data={probe.data}
            />
          {/if}
        {/each}
      </div>
    </div>