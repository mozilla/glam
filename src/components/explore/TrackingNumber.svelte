<script>
import { getContext } from 'svelte';

export let data;
export let placement = 'top';

const top = getContext('top');
const bottom = getContext('bottom');
</script>

<g>
  {#each data as datum}
      <line
        x1={datum[xAccessor]} x2={datum[xAccessor]} y1={$top} y2={$bottom} stroke=black
      />
  {/each}
</g>