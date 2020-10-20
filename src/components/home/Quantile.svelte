<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { DataGraphic } from '@graph-paper/datagraphic';
  import { Axis } from '@graph-paper/guides';
  import Violin from './Violin.svelte';

  import { formatCount, formatPercentDecimal } from '../../utils/formatters';

  export let data;
  export let xScaleType = 'scalePoint';

  let container;
  let width;
  let height = 100;

  let xDomain = Object.keys(data);
  let distSpring = [];
  $: distSpring = Object.entries(data).map(([k, v]) => ({ bin: k, value: v }));

  onMount(() => {
    width = container.getBoundingClientRect().width;
  });
</script>

<div bind:this={container} style="min-height:{height}px">
  {#if width}
    <DataGraphic
      {xDomain}
      xType={xScaleType}
      yType="linear"
      {height}
      top={20}
      bottom={28}
      left={16}
      right={16}>
      <g slot="body" let:bottom let:top let:yScale let:mousePosition let:xScale>
        <Violin
          rawPlacement={bottom}
          showLeft={false}
          orientation="horizontal"
          density={distSpring}
          densityAccessor="value"
          areaColor={'var(--digital-blue-400)'}
          lineColor={'var(--digital-blue-500)'}
          opacity={0.8}
          densityRange={[0, (bottom - top) * 0.8]} />
        {#if mousePosition.x}
          <rect
            in:fade={{ duration: 100 }}
            x={xScale(mousePosition.x) - xScale.step() / 2}
            y={top}
            width={xScale.step()}
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
        <Axis side="bottom" tickFormatter={formatCount} />
        <g style="font-size:11px;">
          {#if mousePosition.x}
            <text
              in:fade={{ duration: 100 }}
              fill="var(--cool-gray-600)"
              x={left}
              text-anchor="start"
              y={top - 4}>
              {formatCount(mousePosition.x)}
            </text>
            <text
              in:fade={{ duration: 100 }}
              fill="var(--cool-gray-600)"
              x={right}
              text-anchor="end"
              y={top - 4}>
              {formatPercentDecimal(data[mousePosition.x])}
              clients
            </text>
          {/if}
        </g>
      </g>
    </DataGraphic>
  {/if}
</div>
