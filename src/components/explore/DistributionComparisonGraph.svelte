<script>
  import { Axis } from '@graph-paper/guides';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';
  import { nearestBelow } from '../../utils/stats';
  import { twoPointSpring } from '../../utils/animation';
  import { distributionComparisonGraph } from '../../utils/constants';

  export let leftPoints;
  export let rightPoints;
  export let dataVolume = Infinity;

  export let xTickFormatter = (t) => Intl.NumberFormat('en', { notation: 'compact' }).format(t);
  export let colorMap = () => 'black';

  export let yDomain;

  export let yScaleType;
  export let key = Math.random().toString(36).substring(7);

  export let bins;

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
  $: xDomain = yDomain;

  console.log(yDomain)
</script>

<div>
  <DataGraphic
    {xDomain}
    {yDomain}
    yType="scalePoint"
    xType={yScaleType}
    width={distributionComparisonGraph.width}
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
      <Axis side="bottom" ticks={bins} tickFormatter={xTickFormatter}/>
    </g>
  </DataGraphic>
</div>
