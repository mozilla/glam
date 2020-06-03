<script>
  import { DataGraphic } from '@graph-paper/datagraphic';
  import { Axis } from '@graph-paper/guides';
  import { Line } from '@graph-paper/elements';

  import Tweenable from '../Tweenable.svelte';

  import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

  import { totalClientsGraph, tween } from '../../utils/constants';
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
  export let reference;
  export let hovered;

  export let hoverValue = {};
</script>

<div>
  <ChartTitle {description} left={totalClientsGraph.left} right={totalClientsGraph.right}>
    {title}
  </ChartTitle>
<DataGraphic
  yType="linear"
  xType={aggregationLevel === 'build_id' ? 'time' : 'scalePoint'}
  xDomain={xDomain}
  yDomain={yDomain}
  width={totalClientsGraph.width}
  height={totalClientsGraph.height}
  top={totalClientsGraph.top}
  left={totalClientsGraph.left}
  right={totalClientsGraph.right}
  bottom={totalClientsGraph.bottom}
  bottomBorder
  borderColor={totalClientsGraph.borderColor}
  bind:mousePosition={hoverValue}
  on:click
>
  <g slot=background let:yScale>
    <Axis side="left" lineStyle=short ticks={yScale.ticks(4)} />
    {#if aggregationLevel === 'build_id'}
      <Axis side="bottom" />
    {:else if xDomain.length <= 5}
      <Axis side="bottom" ticks={xDomain} />
    {:else}
      <Axis side="bottom" />
    {/if}
  </g>
  <g slot=body>
    <Line
      curve="curveLinear"
      {data}
      x="label"
      y="totalClients"
      color="var(--cool-gray-600)"
      areaColor="var(--cool-gray-200)"
      area={true}
    />
  </g>
  <g slot=annotation let:top let:xScale let:yScale let:bottom let:width>
    {#if hovered && hovered.datum}
      <TrackingLine x={hovered.datum.label} />
    {/if}
    {#if reference}
    <Tweenable
      params={tween}
      value={{
        location: xScale(reference.label),
        y: yScale(reference.audienceSize),
        audienceSize: reference.audienceSize,
      }}
      let:tweenValue={tv1}>
      <TrackingLine
        xr={tv1.location}
        data-audienceSize={reference.audienceSize}
      />
    </Tweenable>
    {/if}
    {#if hovered && hovered.datum}
      <TrackingLabel
        align=top x={hovered.datum.label}
        background=var(--cool-gray-100)
        label="Hov."
      />
      <circle
        cx={xScale(hovered.datum.label)}
        cy={yScale(hovered.datum.audienceSize)}
        r=3
        fill=var(--cool-gray-700)
      />

    {/if}
    {#if reference && reference.label && reference.audienceSize !== undefined}
      <Tweenable
        params={tween}
      value={{
        x: xScale(reference.label),
        y: yScale(reference.audienceSize),
        audienceSize: reference.audienceSize,
      }}
      from={{
        x: xScale(reference.label),
        y: yScale(reference.audienceSize),
        audienceSize: reference.audienceSize,
      }} let:tweenValue>
        <ReferenceSymbol
        size={20}
        xLocation={tweenValue.x} yLocation={tweenValue.y} color=var(--cool-gray-700) />
        <TrackingLabel
          align=bottom
          label="Ref."
          xr={tweenValue.x}
          background={bottom - tweenValue.y < 10 ? 'var(--cool-gray-100)' : 'var(--cool-gray-200)'}
          _svelteBugWorkaround={reference.label}
        />
    </Tweenable>
  {/if}
  </g>
  <FirefoxReleaseVersionMarkers labels={false} />
</DataGraphic>
</div>
