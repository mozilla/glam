<script>
import { tweened } from 'svelte/motion';
import { formatToBuildID } from '../../utils/formatters';

export let value;
export let compare;
export let aggregationLevel;

export let params = { duration: 250 };
const tw = tweened(+value, params);
$: $tw = +value;

let parsedLabel = formatToBuildID(new Date($tw));
$: parsedLabel = formatToBuildID(new Date($tw));

function delta(a, b, al) {
  if (al === 'build_id') {
    if (!b) return undefined;
    const hours = (+(b) - +(a)) / 1000 / 60 / 60;
    if (hours < 24 && hours > -24) return `${~~hours} hour${~~hours === 1 ? '' : 's'}`;
    const days = ~~(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
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
}
.big-label--value {
  font-family: var(--main-mono-font);
  text-align: right;
  min-width: var(--space-16x);
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
  <slot name=label></slot>
</div>
<div class=big-label--value>
  {#if value}
  <div>
  {#if aggregationLevel === 'build_id'}
  <span class=big-label--value--date>

      {parsedLabel.slice(0, 4)}-{parsedLabel.slice(4,
      6)}-{parsedLabel.slice(6, 8)}{' '}</span> 
    <span class=big-label--value--time> {parsedLabel.slice(8, 10)}:</span><span class=big-label--value--time>{parsedLabel.slice(10, 12)}:</span><span class=big-label--value--time>{parsedLabel.slice(12, 14)}</span>
    {:else}
        {value}
    {/if}
  </div>
    {/if}

  <div>
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
