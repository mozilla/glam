<script>
import QuantilePlot from '../../../src/components/data-graphics/QuantilePlot.svelte';
import ENGAGEMENT from '../../../tests/data/scalar_parent_browser_engagement_tab_open_event_count.json';
import { makeDataset } from './shared';

const eng = ENGAGEMENT.response;

// construct matrix of label / data key-values

// const HISTOGRAM_KEY = 'histogram';
// const PERCENTILES_KEY = 'percentiles';

// const isMetric = (k) => [HISTOGRAM_KEY, PERCENTILES_KEY].includes(k);


// iterate over all possible values of `client_agg_type` or whatever?


function gatherByAggType(dataset) {
  // get all client_agg_types
  const aggs = dataset[0].data.map((d) => d.client_agg_type);
  // need to interlace by agg.
  const byAgg = aggs.map((aggType) => dataset.map((d) => {
    const di = { ...d };
    di.data = di.data.filter((di) => di.client_agg_type === aggType);
    di.label = aggType;
    return di;
  }));
  return byAgg;
}

</script>

<style>
h4 {
  margin: 0;
  padding-left: 80px;
}
</style>

<div class=story>
    <h1 class="story__title">probe / <span class=probe-head>parent_browser_engagement_tab_open_event_count</span></h1>
  <div class=plot-set>
    {#each gatherByAggType(eng) as agg}
      <div>
        <h4>{agg[0].label}</h4>
        <QuantilePlot data={makeDataset(agg)} />
      </div>
    {/each}
  </div>
</div>