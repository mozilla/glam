<script>
  import { Axis } from '@graph-paper/guides';
  import { quantile } from 'd3-array';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';
  import { distributionComparisonGraph } from '../../utils/constants';
  import { store } from '../../state/store';

  export let innerHeight;
  export let innerWidth;
  export let topTick;
  export let tickIncrement;
  export let key = Math.random().toString(36).substring(7);
  export let activeCategoricalProbeLabels;

  export let density = [];

  let probeKind = $store.probe.details.kind;
  let bins =
    probeKind === 'categorical'
      ? activeCategoricalProbeLabels
      : density.map((d) => d.bin);

  export let xTickFormatter = (t) =>
    probeKind !== 'categorical'
      ? Intl.NumberFormat('en', { notation: 'compact' }).format(t)
      : t;
  export let yTickFormatter = (t) =>
    Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(t);

  const getXTicks = (data) => {
    // for probes with too many data points, we only want to get
    // a limited amount of ticks to avoid crowding the x axis
    if (data.length < 20) return data;
    return data.filter((value, index) => (index + 1) % 10 === 0);
  };

  let allTicks = Array.from(
    Array(Math.ceil(topTick * 100) + tickIncrement).keys()
  )
    .filter((v) => v % tickIncrement === 0)
    .map((v) => v / 100);
  let ticks = [
    0,
    quantile(allTicks, 0.25),
    quantile(allTicks, 0.5),
    quantile(allTicks, 0.75),
    quantile(allTicks, 1),
  ];
</script>

<div>
  <DataGraphic
    xDomain={bins}
    yDomain={[0, topTick]}
    yType="linear"
    xType="scalePoint"
    width={innerWidth * distributionComparisonGraph.widthMult}
    height={(innerHeight * distributionComparisonGraph.heightMult) / 2}
    left={distributionComparisonGraph.left}
    right={distributionComparisonGraph.right}
    bottom={distributionComparisonGraph.bottom}
    top={distributionComparisonGraph.top}
    borderColor={distributionComparisonGraph.borderColor}
    {key}
  >
    <g slot="background" let:left let:bottom let:top let:right />
    <g
      slot="annotation"
      let:left
      let:right
      let:top
      let:bottom
      let:xScale
      let:yScale
    >
      <slot name="glam-body" {top} {bottom} {left} {right} {yScale} {xScale} />
      <Axis
        side="bottom"
        ticks={getXTicks(bins)}
        tickFormatter={xTickFormatter}
      />
      <Axis side="left" {ticks} tickFormatter={yTickFormatter} />
    </g>
  </DataGraphic>
</div>
