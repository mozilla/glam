<script>
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import DataGraphic from 'udgl/data-graphics/DataGraphic.svelte';

export let value;
export let hovered = false;

let V = tweened(0, { duration: 500, easing });
$: $V = value;
let container;
let width;
let height;
$: if (container) {
  width = container.offsetWidth;
  height = container.offsetHeight;
}
const marg = 0;
</script>

<style>
div {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: -1;
}
</style>

<div bind:this={container}>
  {#if width}
    <DataGraphic width={width} height={height} xDomain={[0, 1]} yDomain={[0]} xType=linear top={0} bottom={marg} left={marg} right={marg}>
      <g slot=body let:xScale>
        <rect x={xScale(0)} width={xScale(1)} y={0} height={height - marg * 2} fill={!hovered ? 'white' : 'var(--cool-gray-100'} />
        <rect x={xScale(0)} width={xScale($V)} y={0} height={height - marg * 2} fill=var(--digital-blue-200) />
        <line y1={0} y2={height - marg * 2} x1={xScale($V)} x2={xScale($V)} stroke=var(--cool-gray-400) />
      </g>
    </DataGraphic>
  {/if}
</div>