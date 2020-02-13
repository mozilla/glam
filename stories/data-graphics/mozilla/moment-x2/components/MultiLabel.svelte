<script>
import { getContext } from 'svelte';
import Springable from 'udgl/data-graphics/motion/Springable.svelte';
import { formats } from '../utils/formatters';

export let point = [];
export let xAccessor;
export let yAccessor = [];
export let yValueAccessor = [];
export let format = 'count';
export let labels = [];
export let xOffset = 0;
export let fontSize = 13;
export let xBuffer = 8;
export let yBuffer = 3;
export let colors = [];

// plot the middle and push out from there


const xScale = getContext('xScale');
const yScale = getContext('yScale');
function toLocations(pt, ya, yva) {
  const middle = ~~(ya.length / 2);
  // first, order location by value.
  let locations = ya.map((y, i) => ({
    label: labels[i] || y,
    color: colors[i] || 'black',
    value: pt[y],
    originalValue: pt[yva[i]],
    y: $yScale(pt[y]),
  }));
  locations.sort((a, b) => {
    if (a.value < b.value) return 1;
    return -1;
  });
  let i = middle;
  while (i >= 0) {
    if (i !== middle) {
      const diff = locations[i + 1].y - locations[i].y;
      if (diff <= (fontSize + yBuffer)) {
        locations[i].y -= (fontSize + yBuffer) - diff;
      }
    }
    i -= 1;
  }
  i = middle;
  while (i < ya.length) {
    if (i !== middle) {
      const diff = locations[i].y - locations[i - 1].y;
      if (diff < (fontSize + yBuffer)) {
        locations[i].y += (fontSize + yBuffer) - diff;
      }
    }
    i += 1;
  }
  return locations;
}

let locations = toLocations(point, yAccessor, yValueAccessor);
$: locations = toLocations(point, yAccessor, yValueAccessor);
let container;
let labelWidth = 0;
$: if (container && locations) {
  labelWidth = Math.max(...Array.from(container.querySelectorAll('.widths')).map((q) => q.getBoundingClientRect().width));
}
</script>

<filter id="outliner">
  <!-- Start by grabbing the source graphic (the text) and dilating it-->
  <feMorphology operator="dilate" radius="2" in="SourceGraphic" result="THICKNESS" />
   <!-- Then use the text (the SourceGraphic) again to cut out the inside of the dilated text -->
  <feComposite operator="out" in="THICKNESS" in2="SourceGraphic"></feComposite>
</filter>

<g bind:this={container}>
  {#each locations as location, i (location.label)}
  <Springable value={[location.y, $xScale(point[xAccessor]) + xBuffer + xOffset + labelWidth]} let:springValue={v} params={{ damping: 0.9, stiffness: 0.3 }}>
  <text 
    filter=url(#outliner)
    fill=white
    font-size={fontSize}>
    <tspan 
      dy='.35em' 
      class='widths'
      y={v[0]}
      style="font-weight: bold;"
      text-anchor=end
      x={v[1]} 
    >{formats[format](location.originalValue ? location.originalValue : location.value)}</tspan> 
    <tspan
      dy='.35em' 
      y={v[0]} 
      x={v[1]} 
    >{location.label}</tspan></text>

    <text 
      font-size={fontSize}>
      <tspan
        fill={location.color}
        dy='.35em'
        style="font-weight: bold;"
        class='widths'
        y={v[0]}
        text-anchor=end
        x={v[1]} 
      >{formats[format](location.originalValue ? location.originalValue : location.value)}</tspan> 
      <tspan
        dy='.35em' 
        y={v[0]} 
        fill=var(--cool-gray-800)
        x={v[1]} 
      >{location.label}</tspan></text>
      </Springable>
  {/each}
</g>