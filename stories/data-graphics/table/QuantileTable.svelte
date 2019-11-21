<script>
import QuantileTable from '../../../src/app/patterns/body/elements/QuantileTable.svelte';
import NAV_URL from '../../../tests/data/browser_engagement_navigation_urlbar_build_id.json';
import ACTIVE_TICKS from '../../../tests/data/browser_engagement_active_ticks_build_id.json';
import GCMS from '../../../tests/data/gc_ms_build_id.json';

import { responseToData } from '../../../src/app/state/store';

// import { firefoxVersionMarkers } from '../../../src/app/state/product-versions';

let which = 0;
// only get the first key

function getExampleData(data) {
  let dataset = [...Object.values(Object.values(data)[0])[0]];
  dataset = dataset.slice(0, -1);
  dataset.reverse();
  return dataset;
}

let probes = [
  {
    name: 'gc_ms',
    data: responseToData(GCMS.response),
    probeType: 'histogram',
  },
  {
    name: 'browser_engagement_active_ticks',
    data: responseToData(ACTIVE_TICKS.response),
    probeType: 'scalar',
  },
  {
    name: 'browser_engagement_navigation_urlbar',
    data: responseToData(NAV_URL.response),
    probeType: 'scalar',
  },
];

let currentPage = 0;

function updatePage(event) {
  currentPage = event.detail.page;
}

$: if (which) currentPage = 0;

</script>


<div class=story>
    <div class='view-header'>
        <h1>Quantile Table</h1>
        <div class='selectors'>
          {#each probes as {name, data}, i}
            <label>
              <input type=radio bind:group={which} value={i}>
              {name}
            </label>
          {/each}
          </div>
    </div>
  <div style='width: 936px'>
    {#each probes as probe, i}
      {#if i === which}
        <QuantileTable 
          on:page={updatePage} 
          {currentPage} 
          data={getExampleData(probe.data)}
          probeType={probe.probeType} />
      {/if}
    {/each}
    
  </div>
</div>