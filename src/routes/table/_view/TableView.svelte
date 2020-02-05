<script>
import DataTable from '../../../components/data-tables/DataTable.svelte';
import Row from '../../../components/data-tables/Row.svelte';
import Cell from '../../../components/data-tables/Cell.svelte';

import ProportionSM from './ProportionSM.svelte';

import Pagination from '../../_components/Pagination.svelte';

import {
  formatCount, formatPercentDecimal, ymd, timecode,
} from '../../../utils/formatters';

import { backwards } from '../../../utils/iterables';

export let data; // nested as key, aggregation_type
export let aggregationLevel = 'build_id';
export let key = 'proportions';
export let keyFormatter = (v) => v;
export let valueFormatter = formatPercentDecimal;
export let tooltipFormatter = (v) => undefined;
export let visibleBuckets;
export let colorMap; // bucketColorMap
export let pageSize = 10;
export let currentAggregation;
export let currentKey;
export let bucketTypeLabel = 'Categories';

let totalPages = 0;
let currentPage = 0;
let selectedData = data[currentKey][currentAggregation];
$: selectedData = data[currentKey][currentAggregation];
$: if (selectedData) currentPage = 0;
$: totalPages = Math.ceil(selectedData.length / pageSize);

let largestAudience;
$: largestAudience = Math.max(...selectedData.map((d) => d.audienceSize));

</script>

<style>
span.h {
  font-weight: bold; 
  color: var(--cool-gray-700); 
  font-size: var(--text-01);
}

span.bucket {
  font-weight: normal;
}
</style>

<div style="border-bottom: var(--space-base) solid var(--cool-gray-100);">
  <div style="
    margin-top: var(--space-2x); 
    margin-bottom: var(--space-2x);
    padding-left: var(--space-4x);
    padding-right: var(--space-4x);
  ">
    <Pagination on:page={(evt) => {
        currentPage = evt.detail.page;
      }} {totalPages} currentPage={currentPage} />
  </div>
  <DataTable overflowX={true}>
    <thead>
      
      <Row header>
        <Cell colspan={2} freezeX bottomBorder={false}></Cell>
        <Cell colspan={2} align=left freezeX bottomBorder={false}>
          <span class='h'>
            {bucketTypeLabel}
          </span>
        </Cell>
      </Row>

      <Row header>
        <Cell 
          backgroundColor=var(--cool-gray-subtle)
          topBorder={true}
          bottomBorderThickness=2px freezeX size=max tooltip="the {aggregationLevel === 'build_id' ? ' build id' : 'version' } associated with this row">
          <span class=h>

          {#if aggregationLevel === 'build_id'}
            Build ID
          {:else}
            Version
          {/if}
          </span>
        </Cell>
        <Cell
          topBorder
          rightBorder
          backgroundColor=var(--cool-gray-subtle)
          bottomBorderThickness=2px
          freezeX 
          align=left 
          tooltip="the total number of clients associated with this {aggregationLevel === 'build_id' ? ' build id' : 'version' }">
          <span class=h>
            Clients
          </span>
        </Cell
        >
        <!-- <Cell freezeX rightBorder></Cell> -->
        {#each visibleBuckets as bucket, i}
          <Cell backgroundColor=var(--cool-gray-subtle) tooltip={tooltipFormatter(bucket)} size=small text topBorder={true} bottomBorderThickness=2px>
            <span class=percentile-label-block style="background-color: {colorMap(bucket)}"></span>
            <span class=bucket>{keyFormatter(bucket)}</span>
          </Cell>
        {/each}
      </Row>

    </thead>
    <tbody>
      {#each [...backwards(selectedData)].slice(currentPage * pageSize, (currentPage + 1) * pageSize) as row, i (ymd(row.label) + timecode(row.label))}
        <Row>
          <Cell freezeX backgroundColor=white>
            <div class=build-version>
              {#if aggregationLevel === 'build_id'}
                <div style="font-weight: bold; color: var(--cool-gray-550);">{ymd(row.label)}</div>
                <div>{timecode(row.label)}</div>
              {:else}
                <div>{row.version}</div>
              {/if}
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