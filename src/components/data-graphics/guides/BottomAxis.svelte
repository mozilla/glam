<script>
import { getContext } from 'svelte';
import { fade } from 'svelte/transition';

import SimpleAxis from './SimpleAxis.svelte';

</script>

<SimpleAxis 
  {...$$props}
  side='bottom'
  mainScaleName='xScale'
/>
