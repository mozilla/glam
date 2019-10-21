<script>
import { getContext } from 'svelte';
import { fade } from 'svelte/transition';

export let mainScaleName = 'xScale';
export let mainScale = getContext(mainScaleName);
export let side = 'left'; // left, right, top, bottom
export let bodyDimension = getContext(`${side}Plot`);

let obverse;

if (side === 'left') obverse = 'right';
if (side === 'right') obverse = 'left';
if (side === 'top') obverse = 'bottom';
if (side === 'bottom') obverse = 'top';

export let obverseDimension = getContext(`${obverse}Plot`);

// TEXT ANCHOR
let defaultTextAnchor;
if (side === 'left') defaultTextAnchor = 'end';
else if (side === 'right') defaultTextAnchor = 'start';
else if (side === 'top' || side === 'bottom') defaultTextAnchor = 'middle';

export let textAnchor = defaultTextAnchor;

const defaults = getContext('defaults');
const margins = getContext('margins');

export let tickCount = 5;

export let ticks = mainScale.ticks !== undefined
  ? mainScale.ticks(tickCount)
  : mainScale.domain().reduce((acc, v, i, source) => {
    // let's filter to get the right number of ticks.
    const every = Math.floor(source.length / tickCount);
    if (i % every === 0) {
      acc.push(v);
    }
    return acc;
  }, []);

// we will need to internally calculate TICKS depending on the passed value
// of ticks.
let TICKS;
if (Array.isArray(ticks)) {
  TICKS = ticks;
} else if (typeof ticks === 'function') {
  // if you pass in a function, the function operates
  // on the xScale accordingly and returns whatever it needs
  // to be an array
  TICKS = ticks(mainScale);
}

export let tickDirection = side === 'right' || side === 'bottom' ? 1 : -1;

export let fadeValues = defaults.fadeParams;
export let tickFontSize = defaults.axisTickFontSize;

export let lineStyle = (side === 'left' || side === 'right') ? 'long' : 'short';
export let tickFormatter = (t) => t;

export let showTicks = true;
export let showBorder = false;
export let showLabels = true;
/*
- create option for long / short
- figure out what calcs need to be made:
  -text location: tickLocation + DIRECTION * tickLength + DIRECTION * margins.buffer;
  -tick location:
  -tick length:

*/

let mainDim = (side === 'left' || side === 'right') ? 'x' : 'y';
let secondaryDim = (side === 'left' || side === 'right') ? 'y' : 'x';
// for left / right, we need additional buffer. for top / bottom, we need to move down tickFontSize.
let fontSizeCorrector = (side === 'bottom') ? tickFontSize : margins.buffer;

let tickParams = (t) => {
  const out = {};
  out[`${mainDim}1`] = $bodyDimension + tickDirection * margins.buffer;
  out[`${mainDim}2`] = lineStyle === 'long' ? $obverseDimension : $bodyDimension;
  out[`${secondaryDim}1`] = mainScale(t);
  out[`${secondaryDim}2`] = mainScale(t);
  return out;
};

let borderParams = () => {
  const out = {};
  out[`${secondaryDim}1`] = mainScale.range()[0]; // eslint-disable-line
  out[`${secondaryDim}2`] = mainScale.range()[1]; // eslint-disable-line
  out[`${mainDim}1`] = $bodyDimension;
  out[`${mainDim}2`] = $bodyDimension;
  return out;
};

let textParams = (t) => {
  const out = {};
  // reasoning:       placement      + tick dir      * length * extra + space correction
  out[`${mainDim}`] = $bodyDimension + tickDirection * margins.buffer + tickDirection * fontSizeCorrector;
  out[`${secondaryDim}`] = mainScale(t);
  // correct for vertical text spacing
  if (secondaryDim === 'y') out.dy = '.35em';
  return out;
};

</script>

<g in:fade={fadeValues} class="{side}-axis">
    {#each TICKS as tick, i (tick)}
      {#if showTicks}
        <line
          class=tick
          {...tickParams(tick)}
          stroke='var(--line-gray-01)'
          stroke-width=1
        />
      {/if}
      {#if showBorder}
        <line 
          {...borderParams()}           
          stroke='var(--line-gray-01)'
          stroke-width=1 />
      {/if}
      {#if showLabels}
        <text 
          {...textParams(tick)}
          text-anchor={textAnchor}
          font-size={tickFontSize}
        >{tickFormatter(tick)}</text>
      {/if}
  {/each}
  </g>