<script>

import { onMount } from 'svelte';
import DataGraphic from '../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../components/data-graphics/guides/TopAxis.svelte';
import ProportionRow from './ProportionRow.svelte';
import Pagination from './Pagination.svelte';

import { comparisonSmallMultiple } from '../utils/constants';

import { formatPercent, formatCount } from '../utils/formatters';

export let height = 600;
export let data;
export let pageSize = 10;
export let currentPage = 0;
export let metricType;
export let probeType = 'histogram';
export let activeBuckets;
export let bucketColorMap = () => 'black';

let scrollLeft = 0;
let scrollTop = 0;

let parent;

let totalPages;
$: totalPages = Math.ceil(data.length / pageSize);

let reference = data[0];

const biggestAudience = Math.max(...data.map((d) => d.audienceSize));

function setReference(r) {
  reference = r.detail.value;
}

function getDomain() {
  return (metricType === 'proportions') ? [0, 1]
    : [Math.min, Math.max].map((f) => f(...data.map((d) => f(...Object.values(d.counts)))));
}

let xDomain = getDomain();

let distributionScaleType = 'linear';

const numberFormat = metricType === 'proportions' ? formatPercent : formatCount;

onMount(() => {
  parent.addEventListener('scroll', (e) => {
    scrollLeft = parent.scrollLeft;
    scrollTop = parent.scrollTop;
  });
});

</script>

<style>


thead tr th {
  top: 0;
  position: sticky;
}

.header-cell--dg-scales {
padding:0;
padding-top: var(--space-base)
}

.data-table-container {
  overflow-x: auto;
  border: 2px solid var(--cool-gray-150);
  border-radius: var(--space-1h);
}

</style>

<div>
  {#if totalPages > 1}
    <Pagination on:page {currentPage} {totalPages} />
  {/if}
</div>


<div class=data-table-container bind:this={parent}>
  <table class=data-table>
    <thead>
      <tr>
        <th class="data-table__header-cell data-table__header-cell--text" style="transform: translateX({scrollLeft}px);">
          Build ID
        </th>
        <th style="transform: translateX({scrollLeft}px);" class="data-table__header-cell data-table__header-cell--text">Clients</th>
        <th 
          style="
            transform: translateX({scrollLeft}px);
            background: linear-gradient(to right, white 70%, transparent);
            z-index: 1000;
          " 
          class="data-table__header-cell data-table__header-cell--text header-cell--dg-scales"
        >
          <!-- <DataGraphic
            width={comparisonSmallMultiple.width}
            height={20}
            left={comparisonSmallMultiple.left}
            top={20}
            right={comparisonSmallMultiple.right}
            bottom={0}
            key="header-scale"
            xDomain={xDomain}
            yDomain={['top', 'bottom']}
            xType={distributionScaleType}
          >
            <TopAxis tickCount=6 tickFormatter={numberFormat} />
          </DataGraphic> -->
        </th>
        {#each activeBuckets as bucket, i}
          <th class="header-cell header-cell--text header-cell--percentile">
              <span class=percentile-label-block style="background-color: {bucketColorMap(bucket)}"></span>
            {bucket}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as datum, i (datum.label)}
        <ProportionRow 
          {scrollLeft}
          {scrollTop}
          datum={datum} 
          reference={reference}
          biggestAudience={biggestAudience} 
          isReference={datum.label === reference.label}
          distributionScaleType={distributionScaleType}
          activeBuckets={activeBuckets}
          bucketColorMap={bucketColorMap}
          metricType={metricType}
          xDomain={xDomain}
          on:click={setReference} />
      {/each}     
    </tbody>
  </table>
</div>