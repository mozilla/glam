<script>
import { writable } from 'svelte/store';

export let data;
export let key;
export let resolution = 'ALL_TIME';
export let percentiles = [50];

import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';
import BottomAxis from '../../../src/components/data-graphics/BottomAxis.svelte';
import LeftAxis from '../../../src/components/data-graphics/LeftAxis.svelte';
import Line from '../../../src/components/data-graphics/LineMultiple.svelte';

import {
  buildIDToDate, firstOfMonth, buildIDToMonth, mondays, getFirstBuildOfDays,
} from '../../../src/components/data-graphics/utils/build-id-utils';
import { extractPercentiles } from '../../../src/components/data-graphics/utils/percentiles';

let domain = writable(data.map((d) => d.label));

function setDomain(str) {
  const start = buildIDToDate(data[data.length - 1].label);
  let filtered = data;
  let daysAgo = str === 'WEEK' ? 7 : 30;
  if (str !== 'ALL_TIME') {
    start.setDate(start.getDate() - daysAgo);
    filtered = data.filter((d) => buildIDToDate(d.label) >= start);
  }
  domain.set(filtered.map((d) => d.label));
}

$: setDomain(resolution);
let percentileData = [];

$: percentileData = extractPercentiles(percentiles, data.filter((d) => $domain.includes(d.label)))
  .map((ps, i) => [ps, percentiles[i]]);

let tickFormatter = buildIDToMonth;
let ticks = firstOfMonth;

$: if (resolution === 'ALL_TIME') {
  tickFormatter = buildIDToMonth;
  ticks = firstOfMonth;
} else if (resolution === 'MONTH') {
  tickFormatter = buildIDToMonth;
  ticks = mondays;
} else {
  tickFormatter = buildIDToMonth;
  ticks = getFirstBuildOfDays;
}

</script>

<div class=graphic-and-summary>
  <DataGraphic
    key={key}
    data={data}
    xDomain={$domain}
    yDomain={[0, 1000]}
    yType="numeric"
    width=600
    height=150
  >
    <LeftAxis />
    <BottomAxis ticks={ticks} tickFormatter={tickFormatter} />

    <GraphicBody>
      {#each percentileData as
        [percentile, pi], i (pi)}
          <Line
          curve="curveStep"
          lineDrawAnimation={{ duration: 300 }} 
          xAccessor="label"
          yAccessor="originalPercentileValue"
          color={pi === 50 ? 'var(--digital-blue-400)' : 'var(--digital-blue-300)'}
          data={percentile} />
        {/each}
    </GraphicBody>

  </DataGraphic>
</div>
