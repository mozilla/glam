<script>
import { getContext, onMount } from 'svelte';
import { tweened } from 'svelte/motion';

export let x;
export let xr;
export let label;
export let background = 'transparent';
export let align = 'top';
export let yOffset = 0;

const fontSize = 10;

const xScale = getContext('xScale');
const width = getContext('graphicWidth');
const yStart = getContext(`${align}Plot`);

let dir = align === 'top' ? 1 : -1;
let sideCorrection = align === 'top' ? fontSize - 2 : 0;
let yLocation = $yStart + ((dir) * (sideCorrection + yOffset + 5));
$: yLocation = $yStart + ((dir) * (sideCorrection + yOffset + 5));

let xp = xr || $xScale(x);
$: xp = xr || $xScale(x);


let textElement;
let elementWidth = 0;
let elementTw = tweened(0, { duration: 100 });
onMount(() => {
  elementWidth = textElement.getBoundingClientRect().width;
});

$: $elementTw = (xp < $width / 2) ? 5 : (-elementWidth);

</script>

<style>
.tracking-label {
  fill: var(--cool-gray-650);
  text-transform: uppercase;
  font-size: 10px;
}
</style>

<filter id="outline">
  <feMorphology operator="dilate" radius="1.5" in="SourceGraphic" result="THICKNESS" />
  <feComposite operator="out" in="THICKNESS" in2="SourceGraphic"></feComposite>
</filter>

<text
  filter=url(#outline)
  x={xp}
  dx={$elementTw}
  y={yLocation}
  class=tracking-label
  style="fill:{background};"
>
  {label}
</text>

<text 
  bind:this={textElement}
  x={xp}
  dx={$elementTw}
  y={yLocation}
  class=tracking-label
>
  {label}
</text>