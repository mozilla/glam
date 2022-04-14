<script>
  import { Axis } from '@graph-paper/guides';
  import { Line } from '@graph-paper/elements';
  import { store } from '../../state/store';

  import Tweenable from '../Tweenable.svelte';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';

  import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

  import { totalClientsGraph, tween } from '../../utils/constants';
  import { formatCount } from '../../utils/formatters';

  import ReferenceSymbol from '../ReferenceSymbol.svelte';
  import TrackingLine from './TrackingLine.svelte';
  import TrackingLabel from './TrackingLabel.svelte';

  import ChartTitle from './ChartTitle.svelte';

  export let data;
  export let title;
  export let description;
  export let aggregationLevel;
  export let xDomain;
  export let yDomain;
  export let ref;
  export let hovered;

  export let hoverValue = {};
</script>

<style>
  .count-view {
    font-weight: 300;
    font-size: 0.7em;
    cursor: pointer;
  }
</style>

<div>
  <ChartTitle
    {description}
    left={totalClientsGraph.left}
    right={totalClientsGraph.right}>
    {title}
    <a
      class="count-view"
      on:click={() => store.setField('countView', 'samples')}
      >View Sample Count</a>
  </ChartTitle>
  <DataGraphic
    yType="linear"
    xType={aggregationLevel === 'build_id' ? 'time' : 'scalePoint'}
    {xDomain}
    {yDomain}
    height={totalClientsGraph.height}
    top={totalClientsGraph.top}
    left={totalClientsGraph.left}
    right={totalClientsGraph.right}
    bottom={totalClientsGraph.bottom}
    bottomBorder
    borderColor={totalClientsGraph.borderColor}
    bind:mousePosition={hoverValue}
    on:click>
    <g slot="background" let:yScale>
      <Axis
        side="left"
        lineStyle="short"
        ticks={yScale.ticks(4)}
        tickFormatter={formatCount} />
      {#if aggregationLevel === 'build_id'}
        <Axis side="bottom" />
      {:else if xDomain.length <= 5}
        <Axis side="bottom" ticks={xDomain} />
      {:else}
        <Axis side="bottom" />
      {/if}
    </g>
    <g slot="body">
      <Line
        scaling={false}
        curve="curveLinear"
        {data}
        x="label"
        y="totalClients"
        color="var(--cool-gray-600)"
        areaColor="var(--cool-gray-200)"
        area={true} />
    </g>
    <g slot="annotation" let:top let:xScale let:yScale let:bottom let:width>
      {#if hovered && hovered.datum}
        <TrackingLine x={hovered.datum.label} />
      {/if}
      {#if ref}
        <Tweenable
          params={tween}
          value={{
            location: xScale(ref.label),
            y: yScale(ref.audienceSize),
            audienceSize: ref.audienceSize,
          }}
          let:tweenValue={tv1}>
          <TrackingLine xr={tv1.location} />
        </Tweenable>
      {/if}
      {#if hovered && hovered.datum}
        <TrackingLabel
          align="top"
          x={hovered.datum.label}
          background="var(--cool-gray-100)"
          label="Hov." />
        <circle
          cx={xScale(hovered.datum.label)}
          cy={yScale(hovered.datum.audienceSize)}
          r="3"
          fill="var(--cool-gray-700)" />
      {/if}
      {#if ref && ref.label && ref.audienceSize !== undefined}
        <Tweenable
          params={tween}
          value={{
            x: xScale(ref.label),
            y: yScale(ref.audienceSize),
            audienceSize: ref.audienceSize,
          }}
          from={{
            x: xScale(ref.label),
            y: yScale(ref.audienceSize),
            audienceSize: ref.audienceSize,
          }}
          let:tweenValue>
          <ReferenceSymbol
            size={20}
            xLocation={tweenValue.x}
            yLocation={tweenValue.y}
            color="var(--cool-gray-700)" />
          <TrackingLabel
            align="bottom"
            label="Ref."
            xr={tweenValue.x}
            background={bottom - tweenValue.y < 10
              ? 'var(--cool-gray-100)'
              : 'var(--cool-gray-200)'} />
        </Tweenable>
      {/if}
    </g>
    <FirefoxReleaseVersionMarkers labels={false} />
  </DataGraphic>
</div>
