<script>
import { getContext } from 'svelte';

export let mainScale = getContext('mainScale');
export let side = getContext('side');
export let mainDim = getContext('mainDim');
export let secondaryDim = getContext('secondaryDim');
export let bodyDimension = getContext('bodyDimension');
export let start;
export let end;
export let color = 'var(--cool-gray-300)';
export let width = 1;
export let offset = 0;

let step = 0;
// if ($mainScale.type === 'scalePoint') step = $mainScale.step();
if ($mainScale.type === 'scaleBand') step = $mainScale.bandwidth();
$: if (!start) start = $mainScale.domain()[0]; //eslint-disable-line
$: if (!end) end =  $mainScale.domain().slice(-1)[0]; //eslint-disable-line
let sideOffset = (side === 'left' || side === 'top') ? -offset : offset;

</script>

<line 
{...{
  [`${secondaryDim}1`]: $mainScale(start),
  [`${secondaryDim}2`]: $mainScale(end) + step,
  [`${mainDim}1`]: $bodyDimension + sideOffset,
  [`${mainDim}2`]: $bodyDimension + sideOffset,
}}
stroke={color}
stroke-width={width} />