<script>
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';
import ToplineRow from './ToplineRow.svelte';

import { toplineRefLabel } from '../../utils/constants';

import {
  formatCount, formatSignCount,
  formatParenPercent,
} from '../../utils/formatters';

export let reference;
export let hovered;
export let showHover;
export let aggregationLevel;

function absDiff(a, b, perc = false) {
  return (a - b) / (perc ? b : 1);
}

</script>

<style>
.topline--client-count {
  transition: font-weight 200ms;
}

.topline--client-count--highlighted {
  font-weight: 550;
}

</style>

  <div style='
  padding-left: {toplineRefLabel.left - toplineRefLabel.icon}px;
  display: grid; 
  grid-template-columns: max-content max-content max-content max-content; 
  grid-column-gap: var(--space-2x);
  font-size: var(--text-02);
  align-items: start;
  min-height: var(--space-8x);
  align-content: start;
'>
<Tweenable params={{ duration: 250 }} value={reference.audienceSize} let:tweenValue>
<ToplineRow 
  value={reference.label} 
  {aggregationLevel}
  description="Set the reference point ⭑ by clicking on one of the graphs below."
>
  <span slot='icon'>⭑</span>
    <span slot='label'>
      {#if showHover}
        Reference
      {:else}
        Latest
      {/if}
    </span>
  <span slot='count'>
      <span data-value={reference.audienceSize}>
        <span         
          class=topline--client-count 
          class:topline--client-count--highlighted={hovered.datum && hovered.datum.audienceSize < tweenValue}>
          {formatCount(tweenValue)}
        </span>
        clients
      </span>
  </span>
</ToplineRow>
{#if showHover}
<ToplineRow params={{ duration: 0 }} 
  value={hovered.datum ? hovered.datum.label : undefined}
  compare={reference.label}
  {aggregationLevel}
  description="Hover over the graphs below to compare the hover value ● to the reference ⭑; click to set the hover ● to the reference ⭑."
>
  <span slot='icon'>●</span>
  <span slot='label'>Hovered</span>
  <span slot='count'>
    <div>
      {#if hovered.datum}
      <span 
        class=topline--client-count 
        class:topline--client-count--highlighted={hovered.datum && hovered.datum.audienceSize > tweenValue}>
        {formatCount(hovered.datum.audienceSize)}
      </span> clients{/if}
    </div>
    {#if hovered.datum}
    <div style="
      font-weight: 300;
      white-space: pre;
      color: var(--cool-gray-700)">
{formatSignCount(absDiff(hovered.datum.audienceSize, tweenValue))}  <span style='font-weight: 500;'>{formatParenPercent(
'.0%',
absDiff(hovered.datum.audienceSize, tweenValue, true),
7,
)}</span>
    </div>
    {/if}
  </span>
</ToplineRow>
{/if}
</Tweenable>

</div>