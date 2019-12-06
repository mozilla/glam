<script>
import { onMount } from 'svelte';
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';
import { format } from 'd3-format';
import { fly } from 'svelte/transition';
import DataGraphic from '../../../src/components/data-graphics/DataGraphic.svelte';
import Line from '../../../src/components/data-graphics/elements/Line.svelte';
import Point from '../../../src/components/data-graphics/elements/Point.svelte';

import MarginText from '../../../src/components/data-graphics/guides/MarginText.svelte';
import LeftAxis from '../../../src/components/data-graphics/guides/LeftAxis.svelte';
import BottomAxis from '../../../src/components/data-graphics/guides/BottomAxis.svelte';

import Button from '../../../src/components/Button.svelte';

const fmt = format(',.2f');

function makeLine(m = 3, n = 1) {
  let v = 50;
  return Array.from({ length: 100 }).map((_, i) => {
    const datapoint = { x: i + 1900, y: v };
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * m * n));
    return datapoint;
  });
}

// let's make 25 lines.
const K = 16;
let lines = Array.from({ length: K })
  .map((_, i) => spring(makeLine(5), { stiffness: 0.3, damping: 0.3 }));

const lineSet = derived(lines, ($lines) => $lines);

let hoverValue;

function getY(data, x) {
  const match = data.find((v) => v.x === x);
  if (!match || !x) return undefined;
  return match.y;
}

let mounted = false;

onMount(() => {
  mounted = true;
});

const labels = Array.from({ length: K }).map((_, i) => `Group-${i}`);

</script>

<style>

.lines {
  display: grid;
  grid-template-columns: repeat(4, 200px);
  justify-items: start;
  align-items: start;
  grid-column-gap: var(--space-2x);
  grid-row-gap: var(--space-4x);
  margin-top: var(--space-4x);
}

.offset-for-graphs {
  padding-left: 45px;
  padding-right: 20px;
}

h3 {
  margin:0;
  /* font-weight: 300; */
  font-size: 14px;
  text-align: center;

}

</style>

<div class=story>

  <h1 class="story__title offset-for-graphs">Lines</h1>

  <div class=offset-for-graphs>
    <Button compact level=medium on:click={() => {
      lines.forEach((line, i) => {
        line.set(makeLine(5));
      });
    }}>randomize</Button>
  </div>
{#if mounted}
<div class=lines>
  {#each $lineSet as line, i}
  <div class=small-multiple in:fly={{ duration: 500, delay: (i) * 50, x: -5 }}>
    <h3 class=offset-for-graphs>{labels[i]}</h3>
    <DataGraphic
      xDomain={[1900, 2000]}
      yDomain={[0, 100]}
      yType="linear"
      xType="linear"
      width={200}
      height={100}
      data={line}
      top={20}
      bind:hoverValue={hoverValue}
    >
      <LeftAxis ticks={[0, 50, 100]} showLabels={i === 0} />
      <BottomAxis ticks={[1900, 1950, 2000]} />
      <Line
      lineDrawAnimation={{ duration: 1000, delay: i * 45 }}
        data={line} 
        xAccessor=x 
        yAccessor=y />

      <g slot='mouseover' let:value=>
        {#if hoverValue.body}
        <Point 
            x={hoverValue.x} y={getY(line, Math.floor(hoverValue.x))} r={2} />
          />
          <Point 
            x={hoverValue.x} 
            y={getY(line, Math.floor(hoverValue.x))} 
            r={1 + 10 * (getY(line, Math.floor(hoverValue.x)) / 100)} 
            opacity={0.2}
            />
          <MarginText justify=left temporaryLabel={Math.floor(value.x) || ''} />
          <MarginText justify=right temporaryLabel={value.y ? fmt(getY(line, Math.floor(hoverValue.x))) : ''} />
        {/if}
      </g>

    </DataGraphic>
  </div>
  {/each}
</div>
{/if}
</div>