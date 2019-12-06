<script>
import { setContext, getContext, onMount } from 'svelte';
import { writable, derived } from 'svelte/store';
import { scalePoint, scaleLinear, scaleSymlog } from 'd3-scale';

export let data = getContext('data');
export let svg;
// key is used to uniquely identify a DataGraphic.
// users can supply their own, but one must exist.
// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
export let key = Math
  .random()
  .toString(36)
  .substring(2, 15) + Math.random()
  .toString(36).substring(2, 15);

export let xDomain;
export let yDomain;
export let xType = 'scalePoint';
export let yType = 'scalePoint';

export let left = 50;
export let right = 16;
export let top = 50;
export let bottom = 20;
export let laneGap = 30;
export let buffer = 5;

let xPadding = 0.5;
export let yPadding = 0;

// if x is a function, use that to get xMin / xMax.
// if xMin / xMax is a function, use that to calculate xMin / xMax.
// if xMin / xMax is a string, use that to pull out values for xMin / xMax.
// xType / yType determine what you might need, so start there?

export let margins = {
  left,
  right,
  top,
  bottom,
  laneGap,
  buffer,
};

const DEFAULTS = {
  elementWidth: 60,
  axisTickFontSize: 10,
  flyParams: { y: 10, duration: 300 },
  fadeParams: { duration: 300 },
};

setContext('defaults', DEFAULTS);
setContext('margins', margins);

setContext('key', key);

export let dataGraphic = writable({});

export let width = getContext('width') || 800;
export let height = getContext('height') || 300;

// graphic width, graphic height, body width, body height
export let graphicWidth = writable(width);
$: $graphicWidth = width;

export let graphicHeight = writable(height);
$: $graphicHeight = height;

export let bodyWidth = derived(graphicWidth, ($width) => $width - margins.left - margins.right);
export let bodyHeight = derived(graphicHeight, ($height) => $height - margins.top - margins.bottom);


// set the locations of the plot bounds
export let leftPlot = derived(graphicWidth, () => margins.left);
export let rightPlot = derived(graphicWidth, ($width) => $width - margins.right);

export let topPlot = derived(graphicHeight, () => margins.top);
export let bottomPlot = derived(graphicHeight, ($height) => $height - margins.bottom);

setContext('graphicWidth', graphicWidth);
setContext('graphicHeight', graphicHeight);
setContext('bodyWidth', bodyWidth);
setContext('bodyHeight', bodyHeight);

setContext('leftPlot', leftPlot);
setContext('rightPlot', rightPlot);
setContext('topPlot', topPlot);
setContext('bottomPlot', bottomPlot);

// const xScaleType = xType === 'scalePoint' ? scalePoint : scaleLinear;
// const yScaleType = yType === 'scalePoint' ? scalePoint : scaleLinear;

function getScaleFunction(type) {
  if (type === 'scalePoint') return scalePoint;
  if (type === 'numeric' || type === 'linear') return scaleLinear;
  if (type === 'log') return scaleSymlog;
  return scalePoint;
}

function createXPointScale(values) {
  const scaleFunction = getScaleFunction(xType);// xType === 'scalePoint' ? scalePoint : scaleLinear;
  let scale = scaleFunction()
    .domain(values)
    .range([$leftPlot, $rightPlot]);

  if (xType === 'scalePoint') {
    scale = scale.padding(xPadding);
  }
  scale.type = xType;
  return scale;
}

function createYPointScale(values) {
  // const scaleFunction = yType === 'scalePoint' ? scalePoint : scaleLinear;
  const scaleFunction = getScaleFunction(yType);

  let scale = scaleFunction().domain(values).range([$bottomPlot, $topPlot]);
  if (yType === 'scalePoint') {
    scale = scale.padding(yPadding);
  }
  scale.type = yType;
  return scale;
}

// /////////////////////////////////////////////////////////////////////////

export let yScale = createYPointScale(yDomain);
export let xScale = createXPointScale(xDomain);

setContext('xScale', xScale);
setContext('yScale', yScale);

const internalRolloverStore = writable({
  x: undefined, y: undefined, px: undefined, py: undefined,
});

function createMouseStore(svgElem) {
  let parentSVG = svgElem;
  return {
    setSVG(mountedSVG) {
      parentSVG = mountedSVG;
    },
    subscribe: internalRolloverStore.subscribe,
    onMouseleave() {
      internalRolloverStore.set({
        x: undefined,
        y: undefined,
        px: undefined,
        py: undefined,
        body: false,
      });
    },
    onMousemove(e) {
      if (!parentSVG) return;
      let { clientX, clientY } = e;
      const pt = parentSVG.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      let svgP = pt
        .matrixTransform(parentSVG.getScreenCTM().inverse());
      let actualX = svgP.x;
      let actualY = svgP.y;
      let x;
      let y;
      // set if cursor is in body area.
      let body = false;
      if (actualX > $leftPlot
        && actualX < $rightPlot
        && actualY > $topPlot
        && actualY < $bottomPlot) {
        body = true;
      }
      if (xScale.type === 'scalePoint') {
        const step = xScale.step();
        const xCandidates = xScale.domain()
          .filter((d) => (xScale(d) - step / 2) < actualX && xScale(d) < $rightPlot);
        x = xCandidates[xCandidates.length - 1];
      } else {
        x = xScale.invert(actualX);
      }
      if (yScale.type === 'scalePoint') {
        const yCandidates = yScale.domain().filter((d) => yScale(d) < actualY);
        [y] = yCandidates;
      } else {
        // here, we need to inform a y for scaleLinear.
        // but this shoudl be easy. just reverse the value and return it as y.
        y = yScale.invert(actualY);
      }
      internalRolloverStore.set({
        x, y, px: actualX, py: actualY, body,
      });
    },
  };
}

// function initiateRollovers(parentSVG) {
//   // if (parentSVG === undefined) return;
//   rollover = createMouseStore(parentSVG);
// }

// use bind:rollover to get the current x / y (in domain-land) and px / py (range-land)
export let rollover = createMouseStore(svg);

let onMousemove = (e) => { rollover.onMousemove(e); };
let onMouseleave = (e) => { rollover.onMouseleave(e); };


export let dataGraphicMounted = false;

export let hoverValue = {
  x: undefined, y: undefined, px: undefined, py: undefined,
};

onMount(() => {
  dataGraphicMounted = true;
});

$: if (dataGraphicMounted) {
  // initiateRollovers(svg);
  rollover.setSVG(svg);
  rollover.subscribe((v) => {
    hoverValue = v;
  });
}

</script>

<style>

.data-graphic-container {
  display: grid;
  align-content: center;
  justify-content: center;
}

</style>

<div class=data-graphic-container style="width: {$graphicWidth}px; height: {$graphicHeight}px;">
  <svg
    bind:this={svg}
    shape-rendering="geometricPrecision"
    viewbox='0 0 {$graphicWidth} {$graphicHeight}'
    on:mousemove={onMousemove}
    on:mouseleave={onMouseleave}
    on:click
  >
  <clipPath id='graphic-body-{key}'>
      <rect
        x={$leftPlot}
        y={$topPlot}
        width={$bodyWidth}
        height={$bodyHeight}
      />
    </clipPath>
    {#if dataGraphicMounted}
      <slot></slot>
    {/if}
    <use clip-path="url(#graphic-body-{key})" xlink:href="#graphic-body-content={key}" fill="transparent" />

    <!-- pass the rollover value into the scale -->
    {#if dataGraphicMounted}
      <slot name='mouseover' value={hoverValue} xScale={xScale} yScale={yScale}></slot>
    {/if}
  </svg>
</div>
