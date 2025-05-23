<script>
  import _ from 'lodash';

  import { fly } from 'svelte/transition';
  import { cubicOut as easing } from 'svelte/easing';

  import { Axis } from '@graph-paper/guides';
  import { Line } from '@graph-paper/elements';

  import DataGraphic from '../datagraphic/DataGraphic.svelte';

  import Tweenable from '../Tweenable.svelte';
  import Springable from '../Springable.svelte';

  import BuildIDRollover from './BuildIDRollover.svelte';

  import ReleaseVersionMarkers from '../ReleaseVersionMarkers.svelte';

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

  import {
    getPercentileName,
    getTransformedPercentileName,
    getProportionName,
    getCountName,
  } from '../../config/shared';

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
  export let distViewButtonId;

  // set default reference point to be used in distribution sql
  let defaultRef = data[data.length - 1].build_id;
  store.setField('defaultRef', defaultRef);

  const pushlogUrlTemplate = _.template(
    // eslint-disable-next-line no-template-curly-in-string
    'https://hg.mozilla.org/mozilla-central/pushloghtml?fromchange=${from}&tochange=${to}'
  );

  function createTimeSeries(d, actives, accessor) {
    return actives.map((a) => ({
      bin: a,
      series: d.map((di) => {
        const value = di[accessor] && di[accessor][a];
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

  function getDefaultReferencePoint() {
    if ($store.ref) {
      const found = data.find((d) => d[aggregationLevel] === $store.ref);
      if (found) return found;
    }
    return data[data.length - 1];
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

  const linearMetrics = [
    'histogram-linear',
    'keyed-scalar',
    'scalar',
    'quantity',
    'counter',
  ];

  const desktopLinearMetrics = [
    'histogram-linear',
    'keyed-scalar',
    'scalar',
    'labeled_counter',
  ];

  const getYTicks = (ranges) => {
    // exponential and linear graphs
    if (
      linearMetrics.includes(data[0].metric_type) ||
      yScaleType === 'scalePoint'
    ) {
      // when the range is too small we need to custom set it
      if (ranges[ranges.length - 1] <= 5) return [0, 1, 2, 3, 4, 5];
      if (yScaleType === 'scalePoint' && ranges.length < 5) return yValues;
      return undefined;
    }
    // categorical graphs
    if (
      $store.activeBuckets.length &&
      $store.proportionMetricType === 'proportions'
    ) {
      // when the percentage gets too small we need to manually set the ticks
      if (ranges[ranges.length - 1] - ranges[0] < 0.05)
        return [0, ranges[ranges.length - 1]];
    }
    if (
      $store.activeBuckets.length &&
      $store.proportionMetricType === 'counts'
    ) {
      if (ranges[ranges.length - 1] < 5) return [0, 5];
    }
    return undefined;
  };

  const getYDomain = (visiblePercentiles, buckets, normType) => {
    let yData = [];
    let yDomainValues = [];
    let percentileName = getPercentileName(normType);

    // get percentile data of linear and log graphs
    if (
      linearMetrics.includes(data[0].metric_type) ||
      yScaleType === 'scalePoint'
    ) {
      visiblePercentiles.forEach((p) => {
        yData = yData.concat([
          ...data.map((arr) => arr[percentileName] && arr[percentileName][p]),
        ]);
      });
      // use transformed data for Android metrics
      if (data[data.length - 1].transformedPercentiles) {
        visiblePercentiles.forEach((p) => {
          yData = yData.concat([
            ...data.map(
              (arr) =>
                arr[getTransformedPercentileName(normType)] &&
                arr[getTransformedPercentileName(normType)][p]
            ),
          ]);
        });
      }
    }
    // get proportion and count data of categorical graphs
    if (
      buckets.length &&
      !desktopLinearMetrics.includes(data[0].metric_type) &&
      yScaleType !== 'scalePoint'
    ) {
      // do not change yDomain when all categories are selected
      if ($store.activeBuckets.length === 10) return yDomain;
      if ($store.proportionMetricType === 'proportions') {
        buckets.forEach((bucket) => {
          yData = yData.concat([
            ...data.map(
              (arr) =>
                arr[
                  getProportionName($store.productDimensions.normalizationType)
                ][bucket]
            ),
          ]);
        });
      }
      if ($store.proportionMetricType === 'counts') {
        buckets.forEach((bucket) => {
          yData = yData.concat([
            ...data.map(
              (arr) =>
                arr[getCountName($store.productDimensions.normalizationType)][
                  bucket
                ]
            ),
          ]);
        });
      }
    }

    yDomainValues = _.uniq(yData).sort((a, b) => a - b);
    yDomainValues = yDomainValues.filter(
      (a) => !Number.isNaN(a) && Number.isFinite(a)
    );

    // set the range for each graph type based on graph-paper setting
    if (yScaleType === 'linear' && linearMetrics.includes(data[0].metric_type))
      return yDomainValues[yDomainValues.length - 1]
        ? [yDomainValues[0], yDomainValues[yDomainValues.length - 1]]
        : [0, 1];
    if (
      !desktopLinearMetrics.includes(data[0].metric_type) &&
      yScaleType !== 'scalePoint' &&
      buckets.length
    ) {
      if ($store.proportionMetricType === 'proportions') {
        yDomainValues = yDomainValues.filter((a) => a < 1);
      }
      return [yDomainValues[0], yDomainValues[yDomainValues.length - 1]];
    }
    return yDomainValues.length ? yDomainValues : yDomain;
  };

  $: yValues = getYDomain(
    $store.visiblePercentiles,
    $store.activeBuckets,
    $store.productDimensions.normalizationType
  );
</script>

<style>
  .chart-title {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
  }
</style>

{#if showContextMenu}
  <ChartContextMenu
    {...menuPos}
    {zoomUrl}
    {pushlogUrl}
    {data}
    {clickedRef}
    {clickedHov}
    {distViewButtonId}
  />
{/if}

<div on:contextmenu|preventDefault={onRightClick}>
  <div style="display: flex;">
    <div class="chart-title">
      <ChartTitle
        {description}
        left={aggregationsOverTimeGraph.left}
        right={aggregationsOverTimeGraph.right}
      >
        {title}
      </ChartTitle>
    </div>
    <slot name="smoother" />
  </div>

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
    on:click
  >
    <g slot="background">
      <Axis
        side="left"
        lineStyle="short"
        tickFormatter={yTickFormatter}
        ticks={getYTicks(yValues)}
      />
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
          lineDrawAnimation={{ duration: 500 }}
        />
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
            label="Ref."
          />
        </Tweenable>
      {/if}

      {#if hovered.datum}
        <TrackingLine x={hovered.datum.label} />
        <TrackingLabel
          x={hovered.datum.label}
          align="top"
          background="white"
          label="Hov."
        />
        {#each plotValues(hovered.datum.label, hovered.datum[yAccessor], metricKeys, xScale, yScale) as { x, y, bin }, i (bin)}
          <Springable value={[x, y]} let:springValue>
            <circle
              cx={x}
              cy={y}
              r="3"
              stroke="none"
              fill={lineColorMap(bin)}
            />
          </Springable>
        {/each}
        {#if aggregationLevel === 'build_id'}
          <BuildIDRollover
            x={hovered.datum.label}
            label={hovered.datum.label}
          />
        {/if}
      {/if}

      {#each plotValues(ref.label, ref[yAccessor], metricKeys, xScale, yScale) as { x, y, bin }, i (bin)}
        <g in:fly={{ duration: 150, y: 100, easing }}>
          <Springable value={[x, y]} let:springValue>
            <ReferenceSymbol
              size={25}
              xLocation={springValue[0]}
              yLocation={springValue[1]}
              color={lineColorMap(bin)}
            />
          </Springable>
        </g>
      {/each}
      <ReleaseVersionMarkers />
    </g>
  </DataGraphic>
</div>
