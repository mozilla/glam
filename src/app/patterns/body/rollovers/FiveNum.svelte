<script>
import { getContext } from 'svelte';
import { percentileLineColorMap, percentileLineStrokewidthMap } from '../../../../components/data-graphics/utils/color-maps';


const xScale = getContext('xScale');
const yScale = getContext('yScale');
const margins = getContext('margins');
const T = getContext('topPlot');
const H = getContext('bodyHeight');
let topPlot;
let bodyHeight;

T.subscribe((t) => { topPlot = t; });
H.subscribe((h) => { bodyHeight = h; });

export let x;
export let numbers;

export let p5;
export let p25;
export let p50;
export let p75;
export let p95;

export let valueAccessor = 'y';
export let numberAccessor = 'yi';

let interleaved = [];

$: if (x) {
  // interleaved = [
  //   [numbers[0], numbers[1], percentileLineColorMap(numbers[0][numberAccessor])],
  //   [numbers[1], numbers[2], percentileLineColorMap(numbers[1][numberAccessor])],
  //   [numbers[2], numbers[3], percentileLineColorMap(numbers[3][numberAccessor])],
  //   [numbers[3], numbers[4], percentileLineColorMap(numbers[4][numberAccessor])],
  // ];
  interleaved = [
    [p5, p25, percentileLineColorMap(5)],
    [p25, p50, percentileLineColorMap(25)],
    [p50, p75, percentileLineColorMap(75)],
    [p75, p95, percentileLineColorMap(95)],
  ];
}

[p5, p25, p50, p75, p95].forEach((p) => {
  console.log(yScale(p));
});

// function interleave(data) {
//   // in: [1,2,3,4] out [[1,2], [2,3], [3,4]]
//   let interleaved = Array.from({ length: data.length - 1 }).map((_, i) => [data[i], data[i + 1]]);
//   interleaved.reverse();
//   return interleaved;
// }

</script>

<g>
{#each interleaved as [a, b, color], i}
  <!-- <rect 
    x={xScale(x) - xScale.step() / 2} 
    y={yScale(b[valueAccessor])}
    width={xScale.step()}
    height={yScale(a[valueAccessor]) - yScale(b[valueAccessor])}
    fill={color} /> -->
    <rect 
    x={xScale(x) - xScale.step() / 2} 
    y={yScale(b)}
    width={xScale.step()}
    height={yScale(a) - yScale(b)}
    fill={color} />
{/each}
<rect 
x={xScale(x) + xScale.step() / 2}
y={topPlot}
width={50}
height={bodyHeight}
fill='white' opacity=.8 
/>
{#each [[p5, '5%'], [p25, '25%'], [p50, 'median'], [p75, '75%'], [p95, '95%']]
as [p, l], i (p)}
  <text 
    text-anchor=end
    font-size=12 x={xScale(x) - xScale.step() / 2 - margins.buffer} dy='.35em' y={yScale(p)} fill='black'>{l}</text>
    <text font-size=12 x={xScale(x) + xScale.step() / 2 + margins.buffer} dy='.35em' y={yScale(p)} fill='black'>{p}</text>
{/each}
</g>