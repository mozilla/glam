<script context=module>
let orders = {};
</script>

<script>
import { getContext, onMount } from 'svelte';
import { cubicOut as easing } from 'svelte/easing';
import { tweened } from 'svelte/motion';
import { fade } from 'svelte/transition';

export let location;
export let direction = 'vertical';
export let dasharray = '1,1';
export let lineThickness = 1;
export let lineColor = 'var(--cool-gray-500)';
export let textColor = lineColor;


const key = getContext('key');

if (!(key in orders)) orders[key] = 0;
const ORDER = orders[key];
orders[key] += 1;

export let margins = getContext('margins');

const scale = direction === 'vertical' ? getContext('xScale') : getContext('yScale');

// the location where the marker ends & the text begins.
export let endLocation = direction === 'vertical' ? getContext('topPlot') : getContext('rightPlot');
export let rootLocation = direction === 'vertical' ? getContext('bottomPlot') : getContext('leftPlot');

const distance = direction === 'vertical' ? getContext('bodyHeight') : getContext('bodyWidth');
const animate = true;

let pixelDirection = direction === 'vertical' ? 1 : -1;

const scaling = tweened(pixelDirection, { duration: animate ? 500 : 0, delay: ORDER * 50, easing });

let lineEndCoord;
let lineStartCoord;
let locationCoord;
let textEndCoord;
$: lineEndCoord = $endLocation + ($distance / 2) * $scaling;
$: lineStartCoord = $rootLocation;
$: locationCoord = scale(location);
$: textEndCoord = $endLocation + (-pixelDirection) * margins.buffer + ($distance / 2) * $scaling;

let x1;
let x2;
let y1;
let y2;
let textX;
let textY;
let textAnchor;
let dy;

$: x1 = direction === 'vertical' ? locationCoord : lineStartCoord;
$: x2 = direction === 'vertical' ? locationCoord : lineEndCoord;
$: y1 = direction === 'vertical' ? lineStartCoord : locationCoord;
$: y2 = direction === 'vertical' ? lineEndCoord : locationCoord;
$: textX = direction === 'vertical' ? locationCoord : textEndCoord;
$: textY = direction === 'vertical' ? textEndCoord : locationCoord;
$: textAnchor = direction === 'vertical' ? 'middle' : 'start';
$: dy = direction === 'vertical' ? 0 : '.35em';


// let mounted = false;
onMount(() => {
  // mounted = true;
  scaling.set(0);
});

</script>


  <g style="opacity: {1 - Math.abs($scaling)}"  class=marker>
      <line 
        y1={y1} 
        y2={y2} 
        x1={x1} 
        x2={x2}
        stroke-width={lineThickness}
        stroke-dasharray={dasharray}
        stroke={lineColor} />
      <text 
        x={textX} 
        y={textY} 
        dy={dy}
        font-size=11 
        text-anchor={textAnchor}
        fill={textColor}>
        <slot></slot>
      </text>
  </g>
