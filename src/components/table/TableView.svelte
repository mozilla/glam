<script>
  import { Button, ButtonGroup } from '@graph-paper/button';

  import DataTable from './DataTable.svelte';
  import Row from './Row.svelte';
  import Cell from './Cell.svelte';

  import ProportionSM from './ProportionSM.svelte';
  import CategoricalMenu from '../explore/CategoricalMenu.svelte';

  import Pagination from '../controls/Pagination.svelte';

  import {
    formatCount,
    formatPercentDecimal,
    ymd,
    timecode,
    formatPercent,
  } from '../../utils/formatters';

  import { backwards } from '../../utils/iterables';
  import { store } from '../../state/store';

  export let data; // nested as key, aggregation_type
  export let aggregationLevel = 'build_id';
  export let key = 'proportions';
  export let keyFormatter = (v) => v;
  export let valueFormatter = formatPercentDecimal;
  export let tooltipFormatter = () => undefined;
  export let visibleBuckets;
  export let colorMap; // bucketColorMap
  export let pageSize = 10;
  export let bucketTypeLabel = 'Categories';
  export let bucketOptions;

  let showHistogramData = false;

  let totalPages = 0;
  let currentPage = 0;
  $: if (data) currentPage = 0;
  $: totalPages = Math.ceil(data.length / pageSize);

  let largestAudience;
  $: largestAudience = Math.max(...data.map((d) => d.audienceSize));
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
  <div
    style="
    margin-top: var(--space-2x);
    margin-bottom: var(--space-2x);
    padding-left: var(--space-4x);
    padding-right: var(--space-4x);
  ">
    <Pagination
      on:page={(evt) => {
        currentPage = evt.detail.page;
        store.setField('currentPage', currentPage);
      }}
      {totalPages}
      currentPage={Number($store.currentPage)} />
  </div>

  {#if bucketTypeLabel === 'percentiles'}
    <div style="display: flex; justify-content: flex-end; padding: 1em;">
      <ButtonGroup>
        <Button
          tooltip="Show Percentile Data"
          on:click={() => {
            showHistogramData = false;
          }}
          label="Percentile Data"
          toggled={!showHistogramData}
          level="medium"
          compact />
        <Button
          tooltip="Show Histogram Data"
          on:click={() => {
            showHistogramData = true;
          }}
          label="Histogram Data"
          level="medium"
          toggled={showHistogramData}
          compact />
      </ButtonGroup>
    </div>
  {/if}

  {#if $store.probe.kind === 'categorical'}
    <div style="display: flex; justify-content: flex-end; padding: 1em;">
      <CategoricalMenu
        {data}
        activeBuckets={$store.activeBuckets}
        bucketColorMap={colorMap}
        {bucketOptions} />
    </div>
  {/if}

  <DataTable overflowX={true}>
    <thead>
      <Row header>
        <Cell
          backgroundColor="var(--cool-gray-subtle)"
          topBorder={true}
          bottomBorderThickness="2px"
          freezeX
          size="max"
          tooltip="the {aggregationLevel === 'build_id'
            ? ' build id'
            : 'version'} associated with this row">
          <span class="h">
            {#if aggregationLevel === 'build_id'}Build ID{:else}Version{/if}
          </span>
        </Cell>
        <Cell
          topBorder
          rightBorder
          backgroundColor="var(--cool-gray-subtle)"
          bottomBorderThickness="2px"
          freezeX
          align="left"
          tooltip="the total number of clients associated with this {aggregationLevel ===
          'build_id'
            ? ' build id'
            : 'version'}">
          <span class="h"> Clients </span>
        </Cell>
        <!-- <Cell freezeX rightBorder></Cell> -->
        {#if showHistogramData}
          {#each data[0].histogram as bucket}
            <Cell
              backgroundColor="var(--cool-gray-subtle)"
              size="small"
              text
              topBorder={true}
              bottomBorderThickness="2px">
              <span
                class="percentile-label-block"
                style="background-color: black" />
              <span class="bucket">{bucket.bin}</span>
            </Cell>
          {/each}
        {:else}
          <!-- show percentile data -->
          {#each visibleBuckets as bucket}
            <Cell
              backgroundColor="var(--cool-gray-subtle)"
              tooltip={tooltipFormatter(bucket)}
              size="small"
              text
              topBorder={true}
              bottomBorderThickness="2px">
              <span
                class="percentile-label-block"
                style="background-color: {colorMap(bucket)}" />
              <span class="bucket">{keyFormatter(bucket)}</span>
            </Cell>
          {/each}
        {/if}
      </Row>
    </thead>
    <tbody>
      {#each [...backwards(data)].slice(currentPage * pageSize, (currentPage + 1) * pageSize) as row, i (row.version + ymd(row.label) + timecode(row.label))}
        <Row>
          <Cell freezeX backgroundColor="white">
            <div class="build-version">
              {#if aggregationLevel === 'build_id'}
                <span style="font-weight: bold; color: var(--cool-gray-550);">
                  {ymd(row.label)}
                </span>
                <div>{timecode(row.label)}</div>
              {:else}
                <div>{row.version}</div>
              {/if}
            </div>
          </Cell>
          <Cell rightBorder freezeX>
            <div style="padding: var(--space-base);">
              {formatCount(row.audienceSize)}
              <ProportionSM value={row.audienceSize / largestAudience} />
            </div>
          </Cell>
          <!-- <Cell freezeX rightBorder>
          </Cell> -->
          {#if showHistogramData}
            {#each row.histogram as bucket}
              <Cell size="tiny" backgroundColor="white">
                <span>
                  {formatPercent(bucket.value)}
                </span>
              </Cell>
            {/each}
          {:else}
            {#each visibleBuckets as bucket, j}
              <Cell size="tiny" backgroundColor="white">
                <span
                  style="color:{formatPercentDecimal(row[key][bucket]) !==
                  '0.00%'
                    ? 'var(--cool-gray-700)'
                    : 'var(--cool-gray-200)'};">
                  {valueFormatter(row[key][bucket])}
                </span>
              </Cell>
            {/each}
          {/if}
        </Row>
      {/each}
    </tbody>
  </DataTable>
</div>
