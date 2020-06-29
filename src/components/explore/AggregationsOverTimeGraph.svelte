<script>
  import { fly } from 'svelte/transition';
  import { cubicOut as easing } from 'svelte/easing';

  import { DataGraphic } from '@graph-paper/datagraphic';
  import { Axis } from '@graph-paper/guides';
  import { Line } from '@graph-paper/elements';

  import Tweenable from '../Tweenable.svelte';
  import Springable from '../Springable.svelte';

  import BuildIDRollover from './BuildIDRollover.svelte';

  import FirefoxReleaseVersionMarkers from '../FirefoxReleaseVersionMarkers.svelte';

  import { aggregationsOverTimeGraph } from '../../utils/constants';
  import ReferenceSymbol from '../ReferenceSymbol.svelte';
  import TrackingLine from './TrackingLine.svelte';
  import TrackingLabel from './TrackingLabel.svelte';
  import ChartTitle from './ChartTitle.svelte';

  export let title;
  export let description;
  export let aggregationLevel;
  export let xDomain;
  export let yDomain;
  export let key;
  export let xScaleType;
  export let yScaleType;
  export let data;
  export let insufficientData;
  export let lineColorMap = () => 'gray';
  export let hovered = {};
  export let reference = {};
  export let yTickFormatter;

  export let metricKeys;
  export let yAccessor;

  function createTimeSeries(d, actives, accessor) {
    return actives.map((a) => ({
      bin: a,
      series: d.map((di) => {
        const value = di[accessor][a];
        return {
          y: value,
          x: di.label,
        };
      }),
    }));
  }

  function plotValues(xValue, bins, actives, x, y) {
    return actives.map((b) => ({ x: x(xValue), y: y(bins[b]), bin: b }));
  }

  export let hoverValue = {};
  </script>

  <div>
    <ChartTitle {description} left={aggregationsOverTimeGraph.left} right={aggregationsOverTimeGraph.right} >
      {title}
    </ChartTitle>
    <DataGraphic
      xDomain={xDomain}
      yDomain={yDomain}
      yType={yScaleType}
      xType={xScaleType}
      width={aggregationsOverTimeGraph.width
      - (insufficientData
      ? aggregationsOverTimeGraph.insufficientDataAdjustment
      : 0)}
      height={aggregationsOverTimeGraph.height}
      bottom={aggregationsOverTimeGraph.bottom}
      top={aggregationsOverTimeGraph.top}
      left={aggregationsOverTimeGraph.left}
      right={aggregationsOverTimeGraph.right}
      key={key}
      bind:mousePosition={hoverValue}
      on:click
    >
    <g slot=background>
      <Axis side="left" lineStyle=short tickFormatter={yTickFormatter}  />
      {#if aggregationLevel === 'build_id'}
        <Axis side="bottom" />
      {:else if xDomain.length <= 5}
        <Axis side="bottom" ticks={xDomain} />
      {:else}
        <Axis side="bottom" />
      {/if}
    </g>
    <g slot=body>
      {#each createTimeSeries(data, metricKeys, yAccessor) as {bin, series}, i (bin)}
        <Line
          scaling={false}
          data={series}
          x=x
          y=y
          color={lineColorMap(bin)}
          curve=curveLinear
          lineDrawAnimation={{ duration: 500 }}
        />
      {/each}
    </g>
    <g slot=annotation let:xScale let:yScale>
      {#if reference}
        <Tweenable value={xScale(reference.label)} let:tweenValue={tv1}>
          <TrackingLine data-audienceSize={reference.audienceSize} xr={tv1} key={reference.label} />
          <TrackingLabel data-audienceSize={yScale.domain()[1]} yOffset={16} xr={tv1} align=top background=white label="Ref." />
        </Tweenable>
      {/if}

      {#if hovered.datum}
        <TrackingLine x={hovered.datum.label} />
        <TrackingLabel x={hovered.datum.label} align=top background=white label=Hov. />
        {#each plotValues(hovered.datum.label, hovered.datum[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
          <Springable value={[x, y]} let:springValue>
            <circle
              cx={x}
              cy={y}
              r=3
              stroke="none"
              fill={lineColorMap(bin)}
            />
          </Springable>
      {/each}
      {#if aggregationLevel === 'build_id'}
        <BuildIDRollover x={hovered.datum.label} label={hovered.datum.label} />
      {/if}
      {/if}

      {#each plotValues(reference.label, reference[yAccessor], metricKeys, xScale, yScale) as {x, y, bin}, i (bin)}
        <g in:fly={{ duration: 150, y: 100, easing }}>
          <Springable
            value={[x, y]}
            let:springValue>
              <ReferenceSymbol
                size={25}
                xLocation={springValue[0]} yLocation={springValue[1]} color={lineColorMap(bin)} />
          </Springable>
        </g>
      {/each}
      <FirefoxReleaseVersionMarkers />

    </g>

    </DataGraphic>
  </div>
