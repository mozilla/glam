<script>
import DataGraphic from '../../../../components/data-graphics/DataGraphic.svelte';
import TopAxis from '../../../../components/data-graphics/TopAxis.svelte';
import QuantileRow from './QuantileRow.svelte';

export let data;


let reference = data[0];

function setReference(r) {
  reference = r.detail.value;
}
function diff(a, b) {
  return (b - a) / a;
}
</script>

<style>
.data-table {
  /* width: 100%; */
  border-spacing: 0px;
  position: relative;
}

th {

}


th {

}


thead tr th {
  position: sticky;
  top: 0;
}

.header-cell {
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

.header-cell--text {
  padding-bottom: var(--space-base);
}

.header-cell--dg-scales {
  padding:0;
  padding-top: var(--space-base)
}

</style>


    <table class=data-table>
      <thead>
        <tr>
          <th class="header-cell header-cell--text"></th>
          <th class="header-cell header-cell--text">Clients</th>
          {#each Object.keys(data[0].percentiles) as p, i (p + data[0].percentiles[p])}
            <th class="header-cell header-cell--text">{p}%</th>
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
              xDomain={data[0].histogram.map((d) => d.bin)}
              yDomain={['top', 'bottom']}
            >
              <TopAxis tickCount=6 />
            </DataGraphic>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each data as datum, i (datum.label)}
          <QuantileRow datum={datum} isReference={datum.label === reference.label} on:click={setReference} />
          
        {/each}
      </tbody>
    </table>
