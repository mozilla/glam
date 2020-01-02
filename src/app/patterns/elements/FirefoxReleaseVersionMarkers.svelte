<script>
import { getContext } from 'svelte';
import Marker from '../../../components/data-graphics/guides/Marker.svelte';
import { firefoxVersionMarkers } from '../../state/product-versions';


export let labels = true;

const xScale = getContext('xScale');

let markers = [];
firefoxVersionMarkers.subscribe((m) => { markers = m; });

</script>


<g class='firefox-release-version-markers'>
  {#if markers && markers.length}
    {#each markers
      .filter((d) => d.date !== undefined && d.date >= $xScale.domain()[0] && d.date <= $xScale.domain()[1]) as {label, date}, i (date)}
      <Marker location={date}>
        {#if labels}
          {label}
        {/if}
      </Marker>
    {/each}
  {/if}
</g>