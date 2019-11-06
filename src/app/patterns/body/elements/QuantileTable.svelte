<script>

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
  font-size: var(--text-015);
  text-transform: uppercase;
  font-weight: 600;
  color: var(--cool-gray-500);
}


th {
  border-bottom: 2px solid var(--cool-gray-200);
  background-color: white;
}


thead tr th {
  position: sticky;
  top: 0;
}



</style>


    <table class=data-table>
      <thead>
        <tr>
          <th></th>
          <th>Clients</th>
          {#each Object.keys(data[0].percentiles) as p, i (p + data[0].percentiles[p])}
            <th>{p}%</th>
          {/each}
          <th>Distribution</th>
        </tr>
      </thead>
      <tbody>
        {#each data as datum, i (datum.label)}
          <QuantileRow datum={datum} isReference={datum.label === reference.label} on:click={setReference} />
          
        {/each}
      </tbody>
    </table>
