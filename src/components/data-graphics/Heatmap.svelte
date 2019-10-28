<script>
import { getContext, onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { easeOut } from 'svelte/easing';
import { interpolateRdPu } from 'd3-scale-chromatic';
import { scaleLog, scaleLinear } from 'd3-scale';

export let data;

export let xAccessor = 'x';
export let yAccessor = 'y';
export let heatAccessor = 'heat';
export let scaleType = 'log';
export let xScale = getContext('xScale');
export let yScale = getContext('yScale');
export let heatRange = [0.1, 0.9];
export let transition = { duration: 200, easing: easeOut };
export let hidden = false;

let graphicWidth;
let graphicHeight;

getContext('graphicWidth').subscribe((w) => { graphicWidth = w; });
getContext('graphicHeight').subscribe((h) => { graphicHeight = h; });

const scaleFunction = scaleType === 'linear' ? scaleLinear : scaleLog;

const heatValues = data.map((d) => d[heatAccessor]);
const heatCorrection = scaleType === 'linear' ? 0 : 1;

const scale = scaleFunction()
  .domain([
    Math.min(...heatValues) + heatCorrection,
    Math.max(...heatValues) + heatCorrection])
  .range(heatRange);

let canvas;

let byColor = data.map((d) => ({
  [heatAccessor]: d[heatAccessor] === 0.0 ? 'transparent' : interpolateRdPu(scale(d[heatAccessor])),
  [xAccessor]: xScale(d[xAccessor]),
  [yAccessor]: yScale(d[yAccessor]) - yScale.step() / 2,
}));
  // try to not change the fillStyle and strokeStyle too much.
  // the canvas state machine can be VERY slow otherwise.
const colors = new Set(byColor.map((b) => b[heatAccessor]));
let w = xScale.step();
let h = yScale.step();

const colorCombos = Array.from(colors).reduce((acc, c) => {
  acc[c] = byColor.filter((bc) => bc[heatAccessor] === c);
  return acc;
}, {});

function renderCanvas() {
  const ctx = canvas.getContext('2d');

  colors.forEach((c) => {
    // let theseColors = byColor.filter((bc) => bc[heatAccessor] === c);
    let theseColors = colorCombos[c];
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    theseColors.forEach((d) => {
      ctx.fillRect(d[xAccessor], d[yAccessor], w, h);
      ctx.strokeRect(d[xAccessor], d[yAccessor], w, h);
    });
  });
}

onMount(() => {
  renderCanvas();
});

$: if ((!hidden) && canvas) renderCanvas();

</script>

{#if !hidden}
  <g transition:fade={transition}>
    <foreignObject width={graphicWidth} height={graphicHeight}>
      <canvas bind:this={canvas} width={graphicWidth} height={graphicHeight}  />
    </foreignObject>
  </g>
{/if}