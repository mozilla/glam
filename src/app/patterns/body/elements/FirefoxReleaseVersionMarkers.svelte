<script>
import { getContext } from 'svelte';
import Marker from '../../../../components/data-graphics/Marker.svelte';
import { firefoxVersionMarkers } from '../../../store/product-versions';

import {
  dateToBuildID,
} from '../../../../components/data-graphics/utils/build-id-utils';

const xScale = getContext('xScale');

let markers = [];
firefoxVersionMarkers.subscribe((m) => { markers = m; });
</script>


<g class='firefox-release-version-markers'>
  {#if markers && markers.length}
    {#each markers.map(({ date, label }) => ({ label, date: dateToBuildID(xScale, date) })).filter((d) => d.date !== undefined) as {label, date}, i (date)}
      <Marker location={date}>{label}</Marker>
    {/each}
  {/if}
</g>