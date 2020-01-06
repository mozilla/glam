<script>

import { getContext } from 'svelte';

export let side = getContext('side');
export let mainDim = getContext('mainDim');
export let secondaryDim = getContext('secondaryDim');
export let mainScale = getContext('mainScale');
export let bodyDimension = getContext('bodyDimension');
export let tickDirection = getContext('tickDirection');
export let fontSizeCorrector = getContext('fontSizeCorrector');
export let margins = getContext('margins') || { buffer: 0 };
export let tickFormatter = getContext('tickFormatter') || ((v) => v);
export let align = getContext('align') || 'middle';

// the domain value where the placement should occur
export let placement;
export let offset = 0;
export let rotate = 0;
export let fontSize = 10;
export let fontWeight = 'normal';
export let color = 'black';

function place(v, dim = mainDim) {
  if (mainDim === dim) {
    return $bodyDimension
    + tickDirection * margins.buffer
    + tickDirection * fontSizeCorrector
    + ((side === 'left' || side === 'top') ? -offset : offset);
  }
  return $mainScale(v);
}

</script>

<text 
  {...{
    [`${mainDim}`]: place(placement, mainDim),
    [`${secondaryDim}`]: place(placement, secondaryDim),
    dy: secondaryDim === 'y' ? '.35em' : undefined,
  }}
  text-anchor={align}
  font-size={fontSize}
  font-weight={fontWeight}
  fill={color}
  transform={rotate
    ? `rotate(${rotate} ${place(placement, 'x')} ${place(placement, 'y')})` : ''}
>
  <slot>{tickFormatter(placement)}</slot>
</text>
