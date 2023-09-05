<script>
  import { Axis } from '@graph-paper/guides';
  import DataGraphic from '../datagraphic/DataGraphic.svelte';
  import { distributionComparisonGraph } from '../../utils/constants';

  export let topTick;
  export let key = Math.random().toString(36).substring(7);

  export let density=[];
  export let xTickFormatter = (t) => Intl.NumberFormat('en', { notation: 'compact' }).format(t);
  export let yTickFormatterr = (t) => Intl.NumberFormat('en-US', {style: 'percent', maximumFractionDigits: 2}).format(t)

  let bins = density.map((d) => d['bin'])

  let ticks = Array.from(Array(topTick*100 + 5).keys()).filter(v => v%5 == 0).map(v => v/100)
</script>

<div>
  <DataGraphic
    xDomain={bins}
    yDomain={[0, topTick]}
    yType="linear"
    xType="scalePoint"
    width={distributionComparisonGraph.width}
    height={distributionComparisonGraph.height}
    left={distributionComparisonGraph.left}
    right={distributionComparisonGraph.right}
    bottom={distributionComparisonGraph.bottom}
    top={distributionComparisonGraph.top}
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
      let:yScale={yScale}>
      <slot name="glam-body" {top} {bottom} {left} {right} {yScale} {xScale} />
      <Axis side="bottom" ticks={density.map((d) => d['bin'])} tickFormatter={xTickFormatter}/>
      <Axis side="left" ticks={ticks} tickFormatter={yTickFormatterr}/>
    </g>
  </DataGraphic>
</div>
