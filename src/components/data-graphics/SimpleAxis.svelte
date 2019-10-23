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

function orderMagnitude(n) {
  let order = Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
  return Math.pow(10, order);
}

function symLogTicks(topVal) {
  // symLogTicks is needed until https://github.com/d3/d3-scale/issues/162 is resolved.
  const upper = orderMagnitude(topVal);
  let current = upper;
  const ticks = [upper];
  while (current > 1) {
    current /= 10;
    ticks.push(current);
  }
  ticks.reverse();
  return ticks;
}


function getDefaultTicks() {
  if (mainScale.type === 'numeric' || mainScale.type === 'linear') {
    return mainScale.ticks(tickCount);
  } if (mainScale.type === 'log') {
    return symLogTicks(mainScale.domain()[1]);
  }
  return mainScale.domain().reduce((acc, v, i, source) => {
    // let's filter to get the right number of ticks.
    const every = Math.floor(source.length / tickCount);
    if (i % every === 0) {
      acc.push(v);
    }
    return acc;
  }, []);
}

export let ticks = getDefaultTicks();

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

let tickEnd;
$: tickEnd = lineStyle === 'long' ? $obverseDimension : $bodyDimension;

</script>

<g in:fade={fadeValues} class="{side}-axis">
    {#each TICKS as tick, i (tick)}
      {#if showTicks}
        <line
          class=tick
          {...{
            [`${mainDim}1`]: $bodyDimension + tickDirection * margins.buffer,
            [`${mainDim}2`]: tickEnd,
            [`${secondaryDim}1`]: mainScale(tick),
            [`${secondaryDim}2`]: mainScale(tick),
          }}
          stroke='var(--line-gray-01)'
          stroke-width=1
        />
      {/if}
      {#if showBorder}
        <line 
          {...{
            [`${secondaryDim}1`]: mainScale.range()[0],
            [`${secondaryDim}2`]: mainScale.range()[1],
            [`${mainDim}1`]: $bodyDimension,
            [`${mainDim}2`]: $bodyDimension,
          }}           
          stroke='var(--line-gray-01)'
          stroke-width=1 />
      {/if}
      {#if showLabels}
        <text 
          {...{
            [`${mainDim}`]: $bodyDimension + tickDirection * margins.buffer + tickDirection * fontSizeCorrector,
            [`${secondaryDim}`]: mainScale(tick),
            dy: secondaryDim === 'y' ? '.35em' : undefined,
          }}
          text-anchor={textAnchor}
          font-size={tickFontSize}
        >{tickFormatter(tick)}</text>
      {/if}
  {/each}
  </g>