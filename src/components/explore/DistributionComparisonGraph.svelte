<script>
  import { Axis } from '@graph-paper/guides';

  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';

  import ReferenceSymbol from '../ReferenceSymbol.svelte';

  import ChartTitle from './ChartTitle.svelte';

  import { nearestBelow } from '../../utils/stats';

  import { twoPointSpring } from '../../utils/animation';

  import { distributionComparisonGraph } from '../../utils/constants';

  export let description;
  export let justOne;
  export let rightLabel;
  export let leftPoints;
  export let rightPoints;
  export let activeBins;
  export let dataVolume = Infinity;
  export let showTopAxis = true;

  export let yTickFormatter = (t) => t;
  export let colorMap = () => 'black';

  export let yDomain;

  export let yScaleType;
  export let key = Math.random().toString(36).substring(7);

  export let topLabels;

  if (dataVolume === 1) {
    topLabels = [rightLabel];
  }

  export let xDomain;

  let xScale;
  let yScale;

  function placeShapeY(value) {
    if (!yScale) return distributionComparisonGraph.height;
    if (yScale.type !== 'scalePoint') return yScale(value);
    return yScale(nearestBelow(value, yDomain));
  }

  const dotsAndLines = twoPointSpring(
    rightPoints,
    rightPoints,
    placeShapeY,
    colorMap
  );

  // If insufficient data, let's not use the spring on mount.
  $: if (leftPoints && yScale)
    dotsAndLines.setHover(leftPoints, dataVolume === 1);
  $: if (rightPoints && yScale)
    dotsAndLines.setReference(rightPoints, dataVolume === 1);
  $: xDomain = topLabels;
</script>

<div>
  <DataGraphic
    {xDomain}
    {yDomain}
    yType={yScaleType}
    xType="scalePoint"
    height={distributionComparisonGraph.height}
    bind:xScale
    bind:yScale
    left={distributionComparisonGraph.left}
    right={distributionComparisonGraph.right}
    bottom={distributionComparisonGraph.bottom}
    top={distributionComparisonGraph.top}
    bottomBorder
    borderColor={distributionComparisonGraph.borderColor}
    {key}>
    <g slot="background" let:left let:bottom let:top let:right>

    </g>
    <g
      slot="annotation"
      let:left
      let:right
      let:top
      let:bottom
      let:xScale
      let:yScale>
      <slot name="glam-body" {top} {bottom} {left} {right} {yScale} {xScale} />
      <Axis
        side="right"
        lineStyle="long"
        tickColor="var(--cool-gray-200)"
        tickFormatter={yTickFormatter} />
    </g>
  </DataGraphic>
</div>
