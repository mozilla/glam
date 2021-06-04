<script>
  import _ from 'lodash';

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
  import ChartContextMenu from '../ChartContextMenu.svelte';

  import {
    getActiveProductConfig,
    store,
    showContextMenu,
    toQueryString,
  } from '../../state/store';

  export let title;
  export let description;
  export let aggregationLevel;
  export let xDomain;
  export let yDomain;
  export let key;
  export let xScaleType;
  export let yScaleType;
  export let data;
  export let lineColorMap = () => 'gray';
  export let hovered = {};
  export let ref = {};
  export let yTickFormatter;

  export let metricKeys;
  export let yAccessor;

  const pushlogUrlTemplate = _.template(
    // eslint-disable-next-line no-template-curly-in-string
    'https://hg.mozilla.org/mozilla-central/pushloghtml?fromchange=${from}&tochange=${to}'
  );

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

  let menuPos = { x: 0, y: 0 };
  let zoomUrl;
  let pushlogUrl;

  function generateQueryString(paramsToUpdate) {
    const activeProductConfig = getActiveProductConfig();
    return activeProductConfig
      ? toQueryString({
          ...activeProductConfig.getParamsForQueryString($store),
          ...paramsToUpdate,
        })
      : '';
  }

  // Values we pass to context menu for zoom events.
  let clickedRef;
  let clickedHov;
  let revisionMap = new Map();

  function onRightClick(e) {
    // If the context menu is already up, disable it and return.
    if ($showContextMenu) {
      $showContextMenu = false;
      return;
    }

    // Only show context menu when aggregation is build_id.
    if (aggregationLevel !== 'build_id') {
      return;
    }

    menuPos = { x: e.clientX, y: e.clientY };
    let referencePoint = getDefaultReferencePoint();

    clickedHov = hovered.datum.build_id;
    clickedRef = referencePoint.build_id;

    // Make sure `hov` is on the left of the range.
    [clickedRef, clickedHov] = [
      _.max([clickedRef, clickedHov]),
      _.min([clickedRef, clickedHov]),
    ];

    zoomUrl = generateQueryString({
      clickedHov,
      timeHorizon: 'ZOOM',
    });

    if (referencePoint.revision) {
      revisionMap.set(referencePoint.build_id, referencePoint.revision);
    }
    if (hovered.datum.revision) {
      revisionMap.set(hovered.datum.build_id, hovered.datum.revision);
    }

    if (revisionMap.has(clickedHov) && revisionMap.has(clickedRef)) {
      pushlogUrl = pushlogUrlTemplate({
        from: revisionMap.get(clickedHov),
        to: revisionMap.get(clickedRef),
      });
    }

    // Finally, set the flag to open the context menu.
    $showContextMenu = true; // eslint-disable-line no-unused-vars
  }

  function getDefaultReferencePoint() {
    if ($store.ref) {
      const found = data.find((d) => d[aggregationLevel] === $store.ref);
      if (found) return found;
    }
    return data[data.length - 1];
  }

  // for some reason only this works with function for ticks
  function getDefaultReferencePoint2() {
    if ($store.ref) {
      const found = data.find((d) => d[aggregationLevel] === $store.ref);
      if (found) {
        console.log(found);
        return found;
      }
    }
    return Object.values(getDefaultReferencePoint()['percentiles']);
  }

  // so that it doesn't jump say if we use defaultreferencepoint instead
  const tryThis = (arr) => {
    let something = _.round(arr.length / 5)
    return [arr[0], arr[something], arr[2*something], arr[3*something], arr[arr.length - 1]]
  }

  const getTicks = (ranges) => {
    if (yScaleType === 'linear') return getDefaultReferencePoint2();
    if (ranges.length < 5) return yValues;
    return tryThis(yValues)
  };

  const getYDomain = (percentiles) => {
    let percentileData = [];
    let yDomainValues = [];
    for (const p in percentiles) {
      percentileData = [
        ...percentileData,
        ...data.map((arr) => arr.percentiles[percentiles[p]]),
      ];
    }
    yDomainValues = _.uniq(percentileData).sort((a, b) => a - b);
    if (yScaleType === 'linear') {
      yDomainValues = [
        _.round(yDomainValues[0] - 5, -1),
        yDomainValues[yDomainValues.length - 1],
      ];
    }
    return yDomainValues;
  };
  $: yValues = getYDomain($store.visiblePercentiles);
  $: console.log(
    'yValues',
    yValues,
    'getTicks',
    getTicks(yValues),
    'yscaleType',
    yScaleType,
    'yDomain',
    yDomain,
    'store',
    $store
  );
</script>

{#if showContextMenu}
  <ChartContextMenu
    {...menuPos}
    {zoomUrl}
    {pushlogUrl}
    {data}
    {clickedRef}
    {clickedHov} />
{/if}

<div on:contextmenu|preventDefault={onRightClick}>
  <ChartTitle
    {description}
    left={aggregationsOverTimeGraph.left}
    right={aggregationsOverTimeGraph.right}>
    {title}
  </ChartTitle>
  <DataGraphic
    {xDomain}
    yDomain={yValues}
    yType={yScaleType}
    xType={xScaleType}
    height={aggregationsOverTimeGraph.height}
    bottom={aggregationsOverTimeGraph.bottom}
    top={aggregationsOverTimeGraph.top}
    left={aggregationsOverTimeGraph.left}
    right={aggregationsOverTimeGraph.right}
    {key}
    bind:mousePosition={hoverValue}
    on:click>
    <g slot="background">
      <Axis
        side="left"
        lineStyle="short"
        tickFormatter={yTickFormatter}
        ticks={getTicks(yValues)} />
      {#if aggregationLevel === 'build_id'}
        <Axis side="bottom" />
      {:else if xDomain.length <= 5}
        <Axis side="bottom" ticks={xDomain} />
      {:else}
        <Axis side="bottom" />
      {/if}
    </g>
    <g slot="body">
      {#each createTimeSeries(data, metricKeys, yAccessor) as { bin, series }, i (bin)}
        <Line
          scaling={false}
          data={series}
          x="x"
          y="y"
          color={lineColorMap(bin)}
          curve="curveLinear"
          lineDrawAnimation={{ duration: 500 }} />
      {/each}
    </g>
    <g slot="annotation" let:xScale let:yScale>
      {#if ref}
        <Tweenable value={xScale(ref.label)} let:tweenValue={tv1}>
          <TrackingLine xr={tv1} />
          <TrackingLabel
            yOffset={16}
            xr={tv1}
            align="top"
            background="white"
            label="Ref." />
        </Tweenable>
      {/if}

      {#if hovered.datum}
        <TrackingLine x={hovered.datum.label} />
        <TrackingLabel
          x={hovered.datum.label}
          align="top"
          background="white"
          label="Hov." />
        {#each plotValues(hovered.datum.label, hovered.datum[yAccessor], metricKeys, xScale, yScale) as { x, y, bin }, i (bin)}
          <Springable value={[x, y]} let:springValue>
            <circle
              cx={x}
              cy={y}
              r="3"
              stroke="none"
              fill={lineColorMap(bin)} />
          </Springable>
        {/each}
        {#if aggregationLevel === 'build_id'}
          <BuildIDRollover
            x={hovered.datum.label}
            label={hovered.datum.label} />
        {/if}
      {/if}

      {#each plotValues(ref.label, ref[yAccessor], metricKeys, xScale, yScale) as { x, y, bin }, i (bin)}
        <g in:fly={{ duration: 150, y: 100, easing }}>
          <Springable value={[x, y]} let:springValue>
            <ReferenceSymbol
              size={25}
              xLocation={springValue[0]}
              yLocation={springValue[1]}
              color={lineColorMap(bin)} />
          </Springable>
        </g>
      {/each}
      <FirefoxReleaseVersionMarkers />
    </g>
  </DataGraphic>
</div>
