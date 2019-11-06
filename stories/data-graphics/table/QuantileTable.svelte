<script>
import QuantileTable from '../../../src/app/patterns/body/elements/QuantileTable.svelte';
import GCMS from '../../../tests/data/gc_ms_build_id.json';

import {
  byKeyAndAggregation,
} from '../../../src/app/utils/probe-utils';

let data = byKeyAndAggregation(GCMS.response)[undefined]['summed-histogram'];

data.reverse();
data = data.slice(1);

</script>


<div class=story>
  <h1 class=story__title>
    NOTE: this is a WIP.
  </h1>
  <div style='width: 936px'>
    <QuantileTable data={data} />
  </div>
</div>