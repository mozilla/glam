<script>
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import RadialArcSpinner from 'udgl/spinners/RadialArcSpinner.svelte';

let mounted = false;
onMount(() => { mounted = true; });

</script>

<div class=story>
  <h1 class=story__title>Loading Spinners</h1>
  {#if mounted}
    <div in:fade>
      <RadialArcSpinner size={500} />
    </div>
  {/if}
</div>