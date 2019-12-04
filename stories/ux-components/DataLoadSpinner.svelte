<script>
import { onMount } from 'svelte';
import { spring } from 'svelte/motion';
import { derived } from 'svelte/store';
import { draw, fade } from 'svelte/transition';
import { lineRadial, curveCatmullRomClosed } from 'd3-shape';
import { scaleLinear } from 'd3-scale';

export let size = 200;

const I = 20;

function makeLine(dl, dh, rl, rh) {
  const angle = scaleLinear()
    .domain([0, I])
    .range([0, 2 * Math.PI]);
  const radius = scaleLinear().domain([dl, dh]).range([rl, rh]);
  return lineRadial()
    .angle((d) => angle(d.y))
    .radius((d) => radius(d.x))
    .curve(curveCatmullRomClosed);
}

function randomLine() {
  let v = 0.5;
  let out = Array.from({ length: I * 4 }).map((_, i) => {
    let inc = (Math.random() - 0.5) / 5;
    if (v + inc > 1) v -= inc;
    else if (v + inc < 0) v -= inc;
    else v += inc;

    return { x: v, y: i };
  });
  return out;
}


const L = makeLine(0, 1, size / 2 - size / 5, size / 2 - 10);
const R = makeLine(0, 1, 10, 20);

const outside = Array.from({ length: 5 }).map(() => spring(randomLine(), { damping: 0.2 + Math.random() / 5, stiffness: 0.2 + Math.random() / 5 }));

const allOutside = derived(outside, ($lines) => $lines.map(L));


const T = 400;

let mounted = false;
onMount(() => {
  mounted = true;
});

const FONT_SIZE = 14;
const loadingSpring = spring(FONT_SIZE, { damping: 0.7, stiffness: 0.6 });

let s = false;
setInterval(() => {
  if (mounted === false) mounted = true;
  outside.forEach((l) => {
    l.set(randomLine());
  });
  loadingSpring.set(FONT_SIZE + (s ? 1 : -1));
  s = !s;
}, T);

// setInterval(() => {
//   mounted = !mounted;
// }, T * 4);

</script>

<svg width={size} height={size}>
  {#if mounted}
    {#each $allOutside as l, i}
    <path
      in:draw
      transform="translate({size / 2} {size / 2})" 
      d={l}
      stroke=black
      stroke-width=2
      fill=none
      opacity=.2
    />
    {/each}

    <text
    in:fade={{ duration: 600 }}
    x={size / 2}
    y={size / 2}
    dy=.35em
    font-size={$loadingSpring}
    text-anchor=middle
    fill=black
    opacity=.5
    font-weight=bold
    style="text-transform:uppercase"
  >loading</text>
  {/if}
  
</svg>