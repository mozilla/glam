<script>
  import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';
  import Marker from 'udgl/data-graphics/guides/Marker.svelte';
  import BottomAxis from 'udgl/data-graphics/guides/BottomAxis.svelte';
  import LeftAxis from 'udgl/data-graphics/guides/LeftAxis.svelte';

  const xDomain = Array.from({ length: 100 }).map((_, i) => i);
  const yDomain = Array.from({ length: 100 }).map((_, i) => i);

  const markers = [
    { label: 'A', location: 23 },
    { label: 'B', location: 82 },
  ];

  const options = [
    { direction: 'vertical', dasharray: '1,1' },
    {
      direction: 'horizontal',
      dasharray: '10,1',
      lineColor: 'var(--pantone-red-400)',
      lineThickness: 2,
    },
  ];
</script>

<div class="story">
  <h1 class="story__title">Markers</h1>

  {#each options as opts, i (opts.direction)}
    <DataGraphic {xDomain} {yDomain} width="400" height="200">
      {#each markers as { label, location }, i (label + opts.direction)}
        <Marker {location} {...opts}>{label}</Marker>
      {/each}
      <LeftAxis tickCount="6" />
      <BottomAxis />
    </DataGraphic>
  {/each}
</div>
