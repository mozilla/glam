<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Axis } from '@graph-paper/guides';
  import DataGraphic from '../../graph-paper/datagraphic/DataGraphic.svelte';

  import { createCatColorMap } from '../../utils/color-maps';

  import { formatPercent } from '../../utils/formatters';

  export let data;
  export let info;
  export let metricKind;

  let container;
  let width;
  let height = 100;

  function sortEntriesByValue(a, b) {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    return 0;
  }

  function kLargestBins(binObject, k = 10) {
    const bins = Object.entries(binObject);
    bins.sort(sortEntriesByValue);
    return bins.slice(0, k).map(([n]) => n);
  }

  let xDomain = Object.keys(data);
  let yDomain = [0, Math.max(...Object.values(data)) * 1.3];

  let tickFormatter;
  if (info.kind === 'boolean') {
    tickFormatter = (t) => ['No', 'Yes'][Number(t)];
  } else {
    tickFormatter = (t) => t;
  }

  const colorMap = createCatColorMap(kLargestBins(data));

  function perc(k) {
    const t = Object.values(data).reduce((a, b) => a + b, 0);
    return data[k] / t;
  }

  onMount(() => {
    width = container.getBoundingClientRect().width;
  });
</script>

<div bind:this={container} style="min-height:{height}px">
  {#if width}
    <DataGraphic
      {xDomain}
      {yDomain}
      yType="linear"
      xType="scaleBand"
      xInnerPadding={0.2}
      xOuterPadding={0}
      {width}
      {height}
      top={20}
      bottom={28}
      left={16}
      right={16}>
      <g slot="body" let:xScale let:yScale let:top let:mousePosition let:bottom>
        {#each Object.keys(data) as key, i (key)}
          <rect
            x={xScale(key)}
            y={yScale(data[key])}
            width={xScale.bandwidth()}
            height={yScale(0) - yScale(data[key])}
            fill={colorMap(key) || 'var(--cool-gray-200)'}
            stroke={colorMap(key) || 'var(--cool-gray-200)'}
            fill-opacity=".8" />
        {/each}
        {#if mousePosition.x}
          <rect
            in:fade={{ duration: 100 }}
            x={xScale(mousePosition.x)}
            y={top}
            width={xScale.bandwidth()}
            height={bottom - top}
            fill="var(--cool-gray-600)"
            opacity=".3" />
        {/if}
      </g>
      <g
        slot="annotation"
        let:mousePosition
        let:xScale
        let:top
        let:bottom
        let:left
        let:right>
        {#if metricKind !== 'categorical'}
          <Axis side="bottom" {tickFormatter} />
        {:else}
          <Axis
            side="bottom"
            showLabels={false}
            showTicks={false}
            {tickFormatter} />
        {/if}
        <g style="font-size:11px;">
          {#if mousePosition.x}
            <text
              in:fade={{ duration: 100 }}
              fill="var(--cool-gray-600)"
              x={left}
              text-anchor="start"
              y={top - 4}>
              {tickFormatter(mousePosition.x)}
            </text>
            <text
              in:fade={{ duration: 100 }}
              fill="var(--cool-gray-600)"
              x={right}
              text-anchor="end"
              y={top - 4}>
              {formatPercent(perc(mousePosition.x))}
            </text>
          {/if}
        </g>
      </g>
    </DataGraphic>
  {/if}
</div>
