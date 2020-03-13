<script>
import { format } from 'd3-format';
import Tweenable from 'udgl/data-graphics/motion/Tweenable.svelte';

let pFmt = format('.0%');

export let hovered = false;
export let colorMap = () => 'black';
export let left;
export let right;
export let leftLabel;
export let rightLabel;
export let keySet;
export let binLabel;
export let compareTo = 'left-right';
export let valueFormatter = (t) => t;
export let keyFormatter = (t) => t;
// FIXME: switch to showLeft, showRight, showDiff, showLabels
export let dataVolume = 10;
export let showCategories = true;
export let showLeft = true;
export let showRight = true;
export let showDiff = true;
import Help from 'udgl/icons/Help.svelte';

import { tooltip as tooltipAction } from 'udgl/utils/tooltip';

function percentChange(l, r) {
  return (r - l) / l;
}

let displayValues = [];

function createNewPercentiles(lVal, rVal, ks) {
  return ks.map((key) => {
    const leftValue = lVal ? lVal[key] : undefined;// left.percentiles.find((p) => p.bin === percentile).value : undefined;
    const rightValue = rVal ? rVal[key] : undefined; // right.percentiles.find((p) => p.bin === percentile).value : undefined;
    return {
      key,
      leftValue,
      rightValue,
      percentageChange: (leftValue && rightValue) ? percentChange(leftValue, rightValue) : undefined,
    };
  });
}

$: displayValues = createNewPercentiles(left, right, keySet);

</script>

<style>

.summary {
  padding-bottom: var(--space-2x);
  max-width: 345px;
  width: 100%;
}

table {
  padding-top: 8px;
  font-family: var(--main-mono-font);
  font-size: var(--text-015);
  margin: auto;
  border-spacing: 0px;
  --heavy-border: 1px solid var(--line-gray-01);
  --lighter-border: 1px dotted var(--bg-gray-01);
  width: 100%;
}

tbody tr td {
  border: var(--lighter-border);
}

tbody tr td:first-child, tbody tr td:last-child {
  border-right: var(--heavy-border);
  border-left: var(--heavy-border);
}

tbody tr:last-child td {
  border-bottom: var(--heavy-border);
}

th {
  line-height: 1;
  font-weight: normal;
  text-transform: uppercase;
  vertical-align: top;
  border-bottom: var(--heavy-border);
  font-size: var(--text-01);
  color: var(--cool-gray-500);
}

td, th {
  padding-left: var(--space-base);
  padding-right: var(--space-base);
  text-align: right;
  padding-top: var(--space-base);
  padding-bottom: var(--space-base);
  transition: opacity 100ms;
}

.ref, .hov {
  width: 50%;
}

.hidden {
  opacity: .2;
}

.value-left, .value-right {
  background-color: var(--cool-gray-050);

}

.small-shape {
  padding-left: var(--space-1h);
}

.value-label {
  min-width: calc(var(--space-base) * 7);
  max-width: calc(var(--space-base) * 10);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>

<div class=summary>
    <h3 class=data-graphic__element-title>Summary
        <span use:tooltipAction={
          {
text: 'compares the numeric values of the reference ⭑ to the hovered values ●',
           location: 'top',
}
        } class=data-graphic__element-title__icon><Help size={14} /></span></h3>

  <table>
    <thead>

      <tr>

        <th class="value-label">{binLabel}</th>

            <!-- {#if showLeft}
            <th class:hidden={!hovered} class="summary-label ref">
                <slot name='left-label'>
                  <div>
                      {leftLabel || ''}
                    </slot>
                    {#if hovered}<span class='small-shape'>●</span>{/if}
                  </div>
              </slot>
            </th>
            {/if} -->
            {#if showLeft}
            <th class:hidden={!hovered} class="summary-label ref">
                  <div>
                      {leftLabel || ''}
                    {#if hovered}<span class='small-shape'>●</span>{/if}
                  </div>
            </th>
            {/if}


        <!-- FIXME: let's move to slots here -->
        <!-- {#if showRight}
        <th class="summary-label hov">
          <slot name='right-label'>
            <div>
              <slot name='right-label-text'>
                {rightLabel || ''}
              </slot>
            <span class='small-shape'>⭑</span></div>
          </slot>
        </th>
        {/if} -->
        {#if showRight}
        <th class="summary-label hov">
            <div>
                {rightLabel || ''}
            <span class='small-shape'>⭑</span></div>
        </th>
        {/if}

        {#if showDiff}
          <th style="width: max-content" class:hidden={!hovered}>Diff.</th>
        {/if}

      </tr>

    </thead>
    <tbody>
          {#each displayValues as {leftValue, rightValue, percentageChange, key}, i (key)}
            <tr>
              <td class="value-label" use:tooltipAction={{text: keyFormatter(key), location: 'top'}}>
                <span class=percentile-label-block
                style="background-color:{colorMap(key)}"></span>{keyFormatter(key)}</td>

              {#if showLeft}
              <td  class:hidden={!hovered} class=value-left>
                  {leftValue ? valueFormatter(leftValue) : ' '}
              </td>
              {/if}

              {#if showRight}
              <td class=value-right>
                  {#if rightValue}
                  <Tweenable value={rightValue} let:tweenValue>{valueFormatter(tweenValue)}</Tweenable>
                {:else}
                    {' '}
                {/if}
                <!-- {right ? valueFormatter(rightValue) : ' '} -->
              </td>
              {/if}

              {#if showDiff}
              <td style="min-width: 54px; width: max-content"  class:hidden={!hovered} class=value-change>{percentageChange ? pFmt(percentageChange) : ' '}</td>
              {/if}

            </tr>
          {/each}
    </tbody>
  </table>
</div>
