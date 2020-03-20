<script>
import { tweened } from 'svelte/motion';
import { tooltip as tooltipAction } from 'udgl/utils/tooltip';
import Help from 'udgl/icons/Help.svelte';
import { formatToBuildID } from '../../utils/formatters';

export let value;
export let compare;
export let aggregationLevel;
export let description;

export let params = { duration: 250 };
const tw = tweened(+value, params);
$: $tw = +value;

let parsedLabel = formatToBuildID(new Date($tw));
$: parsedLabel = formatToBuildID(new Date($tw));

function delta(a, b, al) {
  if (al === 'build_id') {
    if (!b) return undefined;
    const hours = (+(b) - +(a)) / 1000 / 60 / 60;
    let hoursLabel = Math.abs(Math.floor(hours));
    let str;
    if (hours < 24 && hours > -24) str = `${hoursLabel} hour${hoursLabel === 1 ? '' : 's'}`;
    else {
      const days = Math.abs(Math.floor(hours / 24));
      str = `${days} day${days === 1 ? '' : 's'}`;
    }
    const dir = hours > 0 ? 'after' : 'before';
    return `${str} ${dir} reference`;
  }
  const versions = b - a;
  return `${versions} versions`;
}
let diff;

$: diff = delta(compare, new Date($tw), aggregationLevel);

</script>

<style>

.big-label--icon {
  color: var(--cool-gray-600);
}

.big-label--label {
  text-transform: uppercase;
  color: var(--cool-gray-600);
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  grid-column-gap: var(--space-1h);
}

.big-label--compare {
  color: var(--cool-gray-600);
}

.big-label--value {
  font-family: var(--main-mono-font);
  text-align: right;
  width: var(--space-32x);
}

.big-label--value--date {
  font-weight: bold;
  color: var(--cool-gray-700);
}

.big-label--value--time {
  color: var(--cool-gray-600);
}

.big-label--count {
  text-align: right;
  font-family: var(--main-mono-font);
  min-width: var(--space-24x);
}
</style>

<div class=big-label--icon>
  <slot name=icon></slot>
</div>
<div class=big-label--label>
  <slot name=label></slot><span use:tooltipAction={
    {
text: description,
     location: 'top',
}
  } class=data-graphic__element-title__icon><Help size={14} /></span>
</div>
<div class=big-label--value>
  {#if value}
  <div>
  {#if aggregationLevel === 'build_id'}
  <span class=big-label--value--date>

      {parsedLabel.slice(0, 4)}-{parsedLabel.slice(4,
      6)}-{parsedLabel.slice(6, 8)}{' '}</span> 
    <span class=big-label--value--time>{parsedLabel.slice(8, 10)}:</span><span class=big-label--value--time>{parsedLabel.slice(10, 12)}:</span><span class=big-label--value--time>{parsedLabel.slice(12, 14)}</span>
    {:else}
        {value}
    {/if}
  </div>
    {/if}

  <div class=big-label--compare>
    <slot name=compare>
      {#if value && compare}
        ({diff})
      {/if}
    </slot>
  </div>

  </div>
  <div class=big-label--count>
    <slot name=count></slot>
  </div>
