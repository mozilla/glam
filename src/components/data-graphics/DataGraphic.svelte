<script>
import { setContext, getContext, onMount } from 'svelte';
import { writable } from 'svelte/store';
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

export let width = getContext('width') || Math.min(DEFAULTS.elementWidth * data.length + margins.left + margins.right, 800);
export let height = getContext('height') || 300;
let bodyWidth = writable(width);

$: $bodyWidth = width - margins.left - margins.right;
let bodyHeight = writable(height - margins.top - margins.bottom);

setContext('bodyWidth', bodyWidth);
setContext('bodyHeight', bodyHeight);

// const xScaleType = xType === 'scalePoint' ? scalePoint : scaleLinear;
// const yScaleType = yType === 'scalePoint' ? scalePoint : scaleLinear;

function createXPointScale(values) {
  const scale = scalePoint()
    .domain([...values])
    .range([margins.left, width - margins.right])
    .padding(0.5);
  scale.type = 'scalePoint';
  return scale;
}

function createYPointScale(values) {
  const scale = scalePoint().domain(values).range([margins.top + $bodyHeight, margins.top]);
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
          .filter((d) => (xScale(d) - step / 2) < actualX && xScale(d) < margins.left + $bodyWidth);
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

<div class=quantile-plot style="width: {width}px; height: {height}px;">
  <svg
    bind:this={svg}
    shape-rendering="geometricPrecision"
    viewbox='0 0 {width} {height}'
    on:mousemove={onMousemove}
    on:mouseleave={onMouseleave}
  >
    <slot></slot>
  </svg>
</div>
