<script>
import { setContext, getContext, onMount } from 'svelte';
import { writable, derived } from 'svelte/store';
import { scalePoint } from 'd3-scale';

export let data = getContext('data');
export let svg;

export let xDomain;
export let yDomain;
export let xType;
export let yType;

// if x is a function, use that to get xMin / xMax.
// if xMin / xMax is a function, use that to calculate xMin / xMax.
// if xMin / xMax is a string, use that to pull out values for xMin / xMax.
// xType / yType determine what you might need, so start there?

export let margins = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 20,
  laneGap: 30,
  buffer: 5,
};

const DEFAULTS = {
  elementWidth: 60,
  axisTickFontSize: 10,
  flyParams: { y: 10, duration: 300 },
  fadeParams: { duration: 300 },
};

setContext('defaults', DEFAULTS);
setContext('margins', margins);

export let dataGraphic = writable({});

function updateDG(k, v) {
  const next = { ...$dataGraphic };
  next[k] = v;
  $dataGraphic = next;
}

export let width = getContext('width') || 800;
export let height = getContext('height') || 300;

// graphic width, graphic height, body width, body height
export let graphicWidth = writable(width);
$: $graphicWidth = width;

export let graphicHeight = writable(height);
$: $graphicHeight = height;

let bodyWidth = derived(graphicWidth, ($width) => $width - margins.left - margins.right);
export let bodyHeight = derived(graphicHeight, ($height) => $height - margins.top - margins.bottom);

// set the locations of the plot bounds
export let leftPlot = derived(graphicWidth, () => margins.left);
export let rightPlot = derived(graphicWidth, ($width) => $width - margins.right);

export let topPlot = derived(graphicHeight, () => margins.top);
export let bottomPlot = derived(graphicHeight, ($height) => $height - margins.bottom);

setContext('bodyWidth', bodyWidth);
setContext('bodyHeight', bodyHeight);

setContext('leftPlot', leftPlot);
setContext('rightPlot', rightPlot);
setContext('topPlot', topPlot);
setContext('bottomPlot', bottomPlot);

// const xScaleType = xType === 'scalePoint' ? scalePoint : scaleLinear;
// const yScaleType = yType === 'scalePoint' ? scalePoint : scaleLinear;

function createXPointScale(values) {
  const scale = scalePoint()
    .domain([...values])
    .range([$leftPlot, $rightPlot])
    .padding(0.5);
  scale.type = 'scalePoint';
  return scale;
}

function createYPointScale(values) {
  const scale = scalePoint().domain(values).range([$bottomPlot, $topPlot]);
  scale.type = 'scalePoint';
  return scale;
}

// /////////////////////////////////////////////////////////////////////////

export let yScale = createYPointScale(yDomain);
export let xScale = createXPointScale(xDomain);

setContext('xScale', xScale);
setContext('yScale', yScale);

function createMouseStore(parentSVG) {
  const { set, subscribe } = writable({
    x: undefined, y: undefined, px: undefined, py: undefined,
  });

  return {
    subscribe,
    onMouseleave() {
      set({
        x: undefined, y: undefined, px: undefined, py: undefined,
      });
    },
    onMousemove(e) {
      if (!parentSVG) return;
      let { clientX, clientY } = e;
      const pt = parentSVG.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      let svgP = pt
        .matrixTransform(parentSVG.getScreenCTM().inverse()); // pt.matrixTransform(svg.getScreenCTM().inverse());
      let actualX = svgP.x;
      let actualY = svgP.y;
      let x;
      let y;
      if (xScale.type === 'scalePoint') {
        const step = xScale.step();
        const xCandidates = xScale.domain()
          .filter((d) => (xScale(d) - step / 2) < actualX && xScale(d) < $rightPlot);
        x = xCandidates[xCandidates.length - 1];
      }
      if (yScale.type === 'scalePoint') {
        const yCandidates = yScale.domain().filter((d) => yScale(d) < actualY);
        [y] = yCandidates;
      }
      set({
        x, y, px: actualX, py: actualY,
      });
    },
  };
}

export let rollover;
let onMousemove = (e) => { rollover.onMousemove(e); };
let onMouseleave = (e) => { rollover.onMouseleave(e); };

function initiateRollovers(parentSVG) {
  if (parentSVG === undefined) return;
  rollover = createMouseStore(parentSVG);
}
initiateRollovers();

export let dataGraphicMounted = false;

onMount(() => {
  dataGraphicMounted = true;
});

$: if (dataGraphicMounted) initiateRollovers(svg);

</script>

<style>

.quantile-plot {
  background-color: white;
  display: grid;
  align-content: center;
  justify-content: center;
}

</style>

<div class=quantile-plot style="width: {$graphicWidth}px; height: {$graphicHeight}px;">
  <svg
    bind:this={svg}
    shape-rendering="geometricPrecision"
    viewbox='0 0 {$graphicWidth} {$graphicHeight}'
    on:mousemove={onMousemove}
    on:mouseleave={onMouseleave}
  >
    <slot></slot>
  </svg>
</div>
