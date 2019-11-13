<script>
import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';
import ProportionRow from './ProportionRow.svelte';
import Pagination from './Pagination.svelte';

import { formatPercent, formatCount } from '../utils/formatters';


export let data;
export let pageSize = 30;
export let currentPage = 0;
export let metricType;
export let probeType = 'histogram';
export let activeBuckets;
export let bucketColorMap = () => 'black';

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

</script>

<style>
.data-table {
/* width: 100%; */
border-spacing: 0px;
position: relative;
}

thead tr th {
position: sticky;
top: 0;
}

.header-cell, .footer-cell {
border-bottom: 2px solid var(--cool-gray-200);
background-color: white;
text-align: right;
padding-left: var(--space-2x);
padding-right: var(--space-2x);
vertical-align: end;
font-size: var(--text-015);
text-transform: uppercase;
font-weight: 600;
color: var(--cool-gray-500);
padding-top: var(--space-base);
/* padding-top: var(--space-2x); */
}

.footer-cell {
border: none;
border-top: 2px solid var(--cool-gray-200);
}

.header-cell--text {
padding-bottom: var(--space-base);
}

.header-cell--percentile {
padding-left: var(--space-base);
padding-right: var(--space-base);
}

.header-cell--dg-scales {
padding:0;
padding-top: var(--space-base)
}

</style>

<table class=data-table>
  <thead>
    <tr>
      <th class="header-cell header-cell--text">
        {#if totalPages > 1}
          <Pagination on:page {currentPage} {totalPages} />
        {/if}
      </th>
      <th class="header-cell header-cell--text">Clients</th>
      {#each activeBuckets as bucket, i}
        <th class="header-cell header-cell--text header-cell--percentile">
            <span class=percentile-label-block style="background-color: {bucketColorMap(bucket)}"></span>
          {bucket}
        </th>
      {/each}
      <th class="header-cell header-cell--dg-scales">
          <DataGraphic
          width={250}
          height={20}
          left={10}
          top={20}
          right={10}
          bottom={0}
          key="header-scale"
          xDomain={xDomain}
          yDomain={['top', 'bottom']}
          xType={distributionScaleType}
        >
          <TopAxis tickCount=6 tickFormatter={numberFormat} />
        </DataGraphic>
      </th>
    </tr>
  </thead>
  <tbody>
    {#each data.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as datum, i (datum.label)}
      <ProportionRow 
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
    {#if totalPages > 1}
    <tr>
        <td class="header-cell footer-cell header-cell--text">
            <Pagination on:page {currentPage} {totalPages} />
        </td>
        <td class="header-cell footer-cell" colspan=100></td>
      </tr>
    {/if}
    
  </tbody>
</table>
