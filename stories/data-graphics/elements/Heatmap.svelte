<script>
import { onMount } from 'svelte';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Heatmap from '../../../src/components/data-graphics/elements/Heatmap.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';
import GraphicBody from '../../../src/components/data-graphics/GraphicBody.svelte';

import GCMS from '../../../tests/data/gc_ms_build_id.json';

import {
  byKeyAndAggregation,
} from '../../../src/app/utils/probe-utils';

let gcms = byKeyAndAggregation(GCMS.response)[undefined]['summed-histogram'];

// get extents.

let dates = gcms.map((d) => d.label);
let xDomain = [new Date(Math.min(...dates)), new Date(Math.max(...dates))];

function xyheat(d, x = 'label', y = 'bin', heat = 'value') {
  return d.map((di) => {
    const label = di[x];
    // this needs to return an array of values
    return di.histogram.map((dii) => {
      let out = {};
      out[x] = label;
      out[y] = dii[y];
      out[heat] = dii[heat];
      return out;
    });
  }).flat();
}

const heat = xyheat(gcms);
const median = gcms.map((d) => ({ label: d.label, median: d.transformedPercentiles[50] }));
let mounted = false;
onMount(() => {
  mounted = true;
});
let active = true;
</script>

<div class=story>
<h1 class=story__title>Heatmap</h1>

<input type=checkbox bind:checked={active} /> Active

<DataGraphic
  {xDomain}
  yDomain={gcms[0].histogram.map((d) => d.bin)}
  xType=time
  left={40}
  right={40}
  bottom={40}
  top={40}
>
  <GraphicBody>
    {#if mounted}
      <Heatmap 
        data={heat}
        xAccessor={'label'}
        yAccessor={'bin'}
        heatAccessor={'value'}
        transition={{ duration: 100, easing }}
        hidden={!active}
      />
      {/if}
  </GraphicBody>

  <LeftAxis tickCount=6 />
  <BottomAxis />
  {#if mounted}
    <Line 
      xAccessor="label"
      yAccessor="median"
      data={median}
      lineDrawAnimation={{ duration: 500, delay: 300, easing }}
    />
  {/if}
</DataGraphic>

</div>