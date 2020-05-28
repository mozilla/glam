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

function pluralize(s, c) {
  return `${s}${Math.abs(c) === 1 ? '' : 's'}`;
}

function when(v) {
  return v > 0 ? 'after' : 'before';
}

function delta(a, b, al) {
  if (al === 'build_id') {
    if (!b) return undefined;
    const hours = (+(b) - +(a)) / 1000 / 60 / 60;
    let hoursLabel = Math.abs(Math.floor(hours));
    let str;
    if (hours < 24 && hours > -24) str = `${hoursLabel} ${pluralize('hour', hoursLabel)}`;
    else {
      const days = Math.abs(Math.floor(hours / 24));
      str = `${days} ${pluralize('day', days)}`;
    }
    return `${str} ${when(hours)} reference`;
  }
  const versions = b - a;
  const versionsLabel = Math.abs(versions);
  return `${versionsLabel} ${pluralize('version', versionsLabel)} ${when(versions)} reference`;
}

$: $tw = +value;
$: diff = delta(compare, new Date($tw), aggregationLevel);
$: parsedLabel = formatToBuildID(new Date($tw));

</script>

<style>

.big-label__icon {
  color: var(--cool-gray-600);
}

.big-label__label {
  text-transform: uppercase;
  color: var(--cool-gray-600);
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  grid-column-gap: var(--space-1h);
}

.big-label__value {
  font-family: var(--main-mono-font);
  text-align: right;
  width: var(--space-32x);
}

.big-label__value__date {
  font-weight: bold;
  color: var(--cool-gray-700);
}

.big-label__value__time {
  color: var(--cool-gray-600);
}

.big-label__value__compare {
  color: var(--cool-gray-600);
}

.big-label__count {
  text-align: right;
  font-family: var(--main-mono-font);
  min-width: var(--space-24x);
}
</style>

<div class=big-label__icon>
  <slot name=icon></slot>
</div>
<div class=big-label__label>
  <slot name=label></slot><span use:tooltipAction={
    {
      text: description,
      location: 'top',
    }
  } class=data-graphic__element-title__icon><Help size={14} /></span>
</div>
<div class=big-label__value>
  {#if value}
    <div>
    {#if aggregationLevel === 'build_id'}
      {value}
      <!-- <span class=big-label__value__date>
        {parsedLabel.slice(0, 4)}-{parsedLabel.slice(4,
        6)}-{parsedLabel.slice(6, 8)}</span>
      <span class=big-label__value__time>{parsedLabel.slice(8, 10)}:</span><span class=big-label__value__time>{parsedLabel.slice(10, 12)}:</span><span class=big-label__value__time>{parsedLabel.slice(12, 14)}</span> -->
      {:else}
          {value}
      {/if}
    </div>
  {/if}

  <!-- <div class=big-label__value__compare>
    <slot name=compare>
      {#if value && compare}
        ({diff})
      {/if}
    </slot>
  </div> -->
</div>

<div class=big-label__count>
  <slot name=count></slot>
</div>
