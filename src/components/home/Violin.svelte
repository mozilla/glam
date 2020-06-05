<script>
import { getContext, onMount } from 'svelte';
import { scaleLinear } from 'd3-scale';
import {
  area, curveLinear as curve,
} from 'd3-shape';

export let orientation = 'vertical';
export let placementScale = getContext(orientation === 'vertical' ? 'xScale' : 'yScale');
export let valueScale = getContext(orientation === 'vertical' ? 'yScale' : 'xScale');
export let key;
export let placement;
export let rawPlacement;
export let density;
export let opacity = 1;
export let densityAccessor = 'weight';
export let valueAccessor = 'key';
export let showLeft = true;
export let showRight = true;
export let showTop = true;
export let showBottom = true;
export let areaColor = 'var(--digital-blue-600)';
export let lineColor = 'var(--digital-blue-600)';
export let densityRange = [0, $placementScale.step() * 0.5 * 0.75];

const getValues = (data) => data.map((obj) => obj[densityAccessor]);

let mounted = false;

let plotDensities = density;
$: if (placement || key) {
  plotDensities = [...density.map((obj) => ({ ...obj }))];
}

const smallBarMultipleScale = (obj, range = [0, 20]) => {
  const v = getValues(obj);
  return scaleLinear().domain([
    Math.min(...v), Math.max(...v),
  ]).range(range);
};

let valueScaleType = $valueScale.type;
let valueScaleAdjustment = valueScaleType === 'scalePoint' ? $valueScale.step() / 2 : 0;

let histogramScale = smallBarMultipleScale(plotDensities, densityRange);
$: histogramScale = smallBarMultipleScale(plotDensities, densityRange);

let topDensity = orientation === 'vertical' ? 'x1' : 'y1';
let baseDensity = orientation === 'vertical' ? 'x0' : 'y0';
let binLocation = orientation === 'vertical' ? 'y' : 'x';
let derivedLine = orientation === 'vertical' ? 'lineX1' : 'lineY1';

let [histogramArea, inverseHistogramArea] = [1, -1].map((direction) => area()
  .defined((d) => d.value > 0.0)
  [topDensity]((d) => direction * histogramScale(d.value))
  [baseDensity](() => histogramScale(0))
  .curve(curve)
  [binLocation]((d) => $valueScale(d.bin) + valueScaleAdjustment));

let histogramLine = histogramArea[derivedLine]()
  [binLocation]((d) => $valueScale(d.bin) + valueScaleAdjustment);
let inverseHistogramLine = inverseHistogramArea[derivedLine]()
  [binLocation]((d) => $valueScale(d.bin) + valueScaleAdjustment);

onMount(() => {
  mounted = true;
});

let translate;
let translateX;
let translateY;
$: translateX = orientation === 'vertical' ? ($placementScale(placement) || rawPlacement) : 0;
$: translateY = orientation === 'vertical' ? 0 : ($placementScale(placement) || rawPlacement);
$: translate = `translate(${translateX}, ${translateY})`;

// $: histogramArea(plotDensities);
</script>

{#if mounted}
<g transform={translate} opacity={opacity}>
  {#if showLeft}
  <path d={histogramArea(plotDensities)} fill={areaColor} opacity={opacity}
  />
  <path d={histogramLine(plotDensities)} stroke={lineColor} opacity={opacity}
  fill=none />
  {/if}
  {#if showRight}
    <path d={inverseHistogramArea(plotDensities)} fill={areaColor}
      opacity={opacity}  />
    <path d={inverseHistogramLine(plotDensities)} stroke={lineColor}
    opacity={opacity} fill=none />
  {/if}
</g>
{/if}
