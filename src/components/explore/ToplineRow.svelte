<script>
  import { tweened } from 'svelte/motion';
  import { Help } from '@graph-paper/icons';
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import { formatToBuildID } from '../../utils/formatters';
  import BuildIdFormattedToDate from './BuildIdFormattedToDate.svelte';

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
      const hours = (+b - +a) / 1000 / 60 / 60;
      let hoursLabel = Math.abs(Math.floor(hours));
      let str;
      if (hours < 24 && hours > -24)
        str = `${hoursLabel} ${pluralize('hour', hoursLabel)}`;
      else {
        const days = Math.abs(Math.floor(hours / 24));
        str = `${days} ${pluralize('day', days)}`;
      }
      return `${str} ${when(hours)} reference`;
    }
    const versions = b - a;
    const versionsLabel = Math.abs(versions);
    return `${versionsLabel} ${pluralize('version', versionsLabel)} ${when(
      versions
    )} reference`;
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

  .big-label__value__compare {
    color: var(--cool-gray-600);
  }

  .big-label__count {
    text-align: left;
    font-family: var(--main-mono-font);
    min-width: var(--space-24x);
  }
</style>

<div class="big-label__icon">
  <slot name="icon" />
</div>
<div class="big-label__label">
  <slot name="label" /><span
    use:tooltipAction={{ text: description, location: 'top' }}
    class="data-graphic__element-title__icon"><Help size={14} /></span>
</div>
<div class="big-label__value">
  {#if value}
    <div>
      {#if aggregationLevel === 'build_id'}
        <BuildIdFormattedToDate buildIdHour={parsedLabel} />
      {:else}{value}{/if}
    </div>
  {/if}

  <div class="big-label__value__compare">
    <slot name="compare">
      {#if value && compare}({diff}){/if}
    </slot>
  </div>
</div>

<div class="big-label__count">
  <slot name="count" />
</div>
