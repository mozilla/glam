<script>
  import DataGraphic from '../../src/components/datagraphic/DataGraphic.svelte';
  import DataTable from '../../src/components/table/DataTable.svelte';
  import Row from '../../src/components/table/Row.svelte';
  import Cell from '../../src/components/table/Cell.svelte';

  // data from 538: https://raw.githubusercontent.com/fivethirtyeight/data/master/drug-use-by-age/drug-use-by-age.csv
  import drugUse from './drug-use-by-age.json';

  const headers = Object.keys(drugUse[0]);
  const which =
    (metricType = 'frequency') =>
    (k) =>
      k.includes(metricType) || k === 'age' || k === 'n';
  let key = 'frequency';

  let width = 35;
  let height = 15;
</script>

<div class="story">
  <h1 class="story__title">Data table with frozen left cells</h1>
  <DataTable overflowX={true}>
    <thead>
      <Row>
        {#each headers.filter(which(key)) as h, i}
          <Cell
            freezeX={i < 2}
            rightBorder={i === 1}
            header
            size={i < 2 ? 'small' : 'tiny'}>
            {#if i < 2}
              {h}
            {:else}
              <div style="writing-mode: vertical-rl; text-orientation: mixed;">
                {h.split('-')[0]}
              </div>
            {/if}
          </Cell>
        {/each}
      </Row>
    </thead>
    <tbody>
      {#each drugUse as row, i (row.age)}
        <Row>
          {#each Object.keys(row).filter(which(key)) as key, j}
            <Cell size="min" freezeX={j < 2} rightBorder={j === 1}>
              {#if j < 2}
                {row[key]}
              {:else}
                <DataGraphic
                  left={0}
                  right={0}
                  top={0}
                  bottom={0}
                  {width}
                  {height}
                  xType="linear"
                  yDomain={[0]}
                  xDomain={[0, 1]}>
                  <g slot="body" let:xScale>
                    <rect
                      x={xScale(0)}
                      y={0}
                      {width}
                      {height}
                      fill="var(--cool-gray-100)" />
                    <rect
                      x={xScale(0)}
                      y={0}
                      width={xScale(row[key] / 1000)}
                      {height}
                      fill="var(--cool-gray-800)" />
                  </g>
                </DataGraphic>
              {/if}
            </Cell>
          {/each}
        </Row>
      {/each}
    </tbody>
  </DataTable>
</div>
