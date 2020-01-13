<script>
import DataTable from '../../src/components/data-tables/DataTable.svelte';
import Row from '../../src/components/data-tables/Row.svelte';
import Cell from '../../src/components/data-tables/Cell.svelte';

// data from 538: https://raw.githubusercontent.com/fivethirtyeight/data/master/drug-use-by-age/drug-use-by-age.csv
import drugUse from './drug-use-by-age.json';

const headers = Object.keys(drugUse[0]);
const which = (metricType = 'frequency') => (k) => k.includes(metricType) || k === 'age' || k === 'n';
let key = 'frequency';
</script>

<div class=story>
  <h1 class=story__title>Data table with frozen left cells</h1>
  <DataTable overflowX={true}>
    <thead>
      <Row>
        {#each headers.filter(which(key)) as h, i}
          <Cell freezeX={i < 2} rightBorder={i === 1} header size={i < 2 ? 'small' : 'tiny'}>
            {#if i < 2}
              {h}
            {:else}
              <div style='writing-mode: vertical-rl; text-orientation: mixed;'>
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
            <Cell size=min freezeX={j < 2} rightBorder={j === 1}>{row[key]}</Cell>
          {/each}
        </Row>
      {/each}
    </tbody>
  </DataTable>
</div>