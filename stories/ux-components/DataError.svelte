<script>
import { onMount } from 'svelte';
import { spring } from 'svelte/motion';

import { randomNormal } from 'd3-random';

export let width = 960;
export let height = 300;

const length = 100;
const xNorm = randomNormal(width / 2, width / 4);
const yNorm = randomNormal(height / 2, height / 8);

function makeData() {
  return Array.from({ length: length * 2 }).map(() => ({ x: xNorm(), y: yNorm() }));
}

const lines = spring(makeData(), { damping: 0.1, stiffness: 0.01 });

let mounted = false;
onMount(() => {
  mounted = true;
  lines.set(makeData());
});

setInterval(() => {
  lines.set(makeData());
}, 4000);

</script>

<style>
svg {
  --line-color: var(--cool-gray-300);
  --base-color: var(--cool-gray-100);
  border:1px solid var(--cool-gray-200);
  border-radius: var(--space-1h);
  background-color: var(--base-color);
}

</style>

<div class=story>
{#if mounted}
<svg width={width} height={height}>
  {#each $lines as line, i}
    <line
      x1={line.x + line.y - height} x2={line.x - (line.y)} y1={-50} y2={height + 50} stroke=var(--line-color) opacity=.25
      stroke-width={line / width * 2}
    />
  {/each}
</svg>
{/if}
</div>
