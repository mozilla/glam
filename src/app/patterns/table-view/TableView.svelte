<script>
import DataTable from '../../../components/data-tables/DataTable.svelte';
import Row from '../../../components/data-tables/Row.svelte';
import Cell from '../../../components/data-tables/Cell.svelte';

import ProportionSM from './ProportionSM.svelte';

import Pagination from '../elements/Pagination.svelte';

import {
  formatCount, formatPercentDecimal, ymd, timecode,
} from '../utils/formatters';

import { backwards } from '../utils/iterables';

export let data; // nested as key, aggregation_type
export let key = 'proportions';
export let keyFormatter = (v) => v;
export let valueFormatter = formatPercentDecimal;
export let visibleBuckets;
export let colorMap; // bucketColorMap
export let pageSize = 15;
export let currentAggregation;
export let currentKey;

let totalPages = 0;
let currentPage = 0;
let selectedData = data[currentKey][currentAggregation];
$: selectedData = data[currentKey][currentAggregation];
$: if (selectedData) currentPage = 0;
$: totalPages = Math.ceil(selectedData.length / pageSize);

let largestAudience;
$: largestAudience = Math.max(...selectedData.map((d) => d.audienceSize));

</script>

<div>
  <div>
    <Pagination on:page={(evt) => {
        currentPage = evt.detail.page;
      }} {totalPages} currentPage={currentPage} />
  </div>
  <DataTable overflowX={true}>
    <thead>
      <Row header>
        <Cell freezeX>Build ID</Cell>
        <Cell freezeX rightBorder>Clients</Cell>
        <!-- <Cell freezeX rightBorder></Cell> -->
        {#each visibleBuckets as bucket, i}
          <Cell size=min text>
            <span class=percentile-label-block style="background-color: {colorMap(bucket)}"></span>
            {keyFormatter(bucket)}
          </Cell>
        {/each}
      </Row>
    </thead>
    <tbody>
      {#each [...backwards(selectedData)].slice(currentPage * pageSize, (currentPage + 1) * pageSize) as row, i (ymd(row.label) + timecode(row.label))}
        <Row>
          <Cell freezeX>
            <div class=build-version>
              <div style="font-weight: bold; color: var(--cool-gray-550);">{ymd(row.label)}</div>
              <div>{timecode(row.label)}</div>
            </div>
          </Cell>
          <Cell  rightBorder freezeX>
            <div style="padding: var(--space-base);">
              {formatCount(row.audienceSize)}
              <ProportionSM value={row.audienceSize / largestAudience} />
            </div>
          </Cell>
          <!-- <Cell freezeX rightBorder>
          </Cell> -->
          {#each visibleBuckets as bucket, j}
            <Cell size=tiny>
              <!-- <ProportionSM value={row.proportions[bucket]} /> -->
              <span style="color:{formatPercentDecimal(row[key][bucket]) !== "0.00%" ? 'var(--cool-gray-700)' : 'var(--cool-gray-200)'}">
                {valueFormatter(row[key][bucket])}
              </span>
            </Cell>
          {/each}
        </Row>
      {/each}
    </tbody>
  </DataTable>
</div>