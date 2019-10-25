<script>
import { getContext, onMount } from 'svelte';
import { scaleLinear } from 'd3-scale';
import {
  area, curveStepBefore as curve,
} from 'd3-shape';

export let xScale = getContext('xScale');
export let yScale = getContext('yScale');
export let key;
export let x;
export let xp;
export let y;
export let opacity = 1;
export let densityAccessor = 'weight';
export let valueAccessor = 'key';
export let showLeft = true;
export let showRight = true;
export let areaColor = 'var(--digital-blue-600)';
export let lineColor = 'var(--digital-blue-600)';
export let densityRange = [0, xScale.step() * 0.5 * 0.75];

const getValues = (data) => data.map((obj) => obj[densityAccessor]);

let mounted = false;

let plotY = y;
$: if (x || key) {
  plotY = [...y.map((obj) => ({ ...obj }))];
}

const smallBarMultipleScale = (obj, range = [0, 20]) => {
  const v = getValues(obj);
  return scaleLinear().domain([
    Math.min(...v), Math.max(...v),
  ]).range(range);
};

let yScaleType = yScale.type;
let yScaleAdjustment = yScaleType === 'scalePoint' ? yScale.step() / 2 : 0;

let histogramScale = smallBarMultipleScale(plotY, densityRange);
$: histogramScale = smallBarMultipleScale(plotY, densityRange);

let [histogramArea, inverseHistogramArea] = [1, -1].map((direction) => area()
  .defined((d) => d.value > 0.0)
  .x1((d) => direction * histogramScale(d.value))
  .x0(() => histogramScale(0))
  .curve(curve)
  .y((d) => yScale(d.bin) + yScaleAdjustment));

let histogramLine = histogramArea.lineX1().y((d) => yScale(d.bin) + yScaleAdjustment);
let inverseHistogramLine = inverseHistogramArea
  .lineX1().y((d) => yScale(d.bin) + yScaleAdjustment);
// $: histogramArea = histogramArea(plotY);
// $: histogramLine = histogramLine(plotY);
// $: inverseHistogramArea = inverseHistogramArea(plotY);
// $: inverseHistogramLine = inverseHistogramLine(plotY);

onMount(() => {
  mounted = true;
});

</script>

{#if mounted}
<g transform="translate({xScale(x) || xp}, 0)" opacity={opacity}>
  {#if showLeft}
  <path d={histogramArea(plotY)} fill={areaColor} opacity={opacity} 
  />
  <path d={histogramLine(plotY)} stroke={lineColor} opacity={opacity} 
  fill=none />
  {/if}
  {#if showRight}
    <path d={inverseHistogramArea(plotY)} fill={areaColor}
      opacity={opacity}  />
    <path d={inverseHistogramLine(plotY)} stroke={lineColor}
    opacity={opacity} fill=none />
  {/if}
</g>
{/if}