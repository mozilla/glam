<script>
import { format } from 'd3-format';
import Tweenable from '../../../components/data-graphics/motion/Tweenable.svelte';

let fmt = format(',.4r');
let pFmt = format('.0%');

export let hovered = false;
export let colorMap = () => 'black';
export let left;
export let right;
export let leftLabel;
export let rightLabel;
export let keySet;
export let compareTo = 'left-right';
export let valueFormatter = (t) => t;
export let keyFormatter = (t) => t;
// FIXME: switch to showLeft, showRight, showDiff, showLabels
export let dataVolume = 10;
export let showCategories = true;
export let showLeft = true;
export let showRight = true;
export let showDiff = true;

function percentChange(l, r) {
  return (r - l) / l;
}

let displayValues = [];

function createNewPercentiles() {
  return keySet.map((key) => {
    const leftValue = left ? left[key] : undefined;// left.percentiles.find((p) => p.bin === percentile).value : undefined;
    const rightValue = right ? right[key] : undefined; // right.percentiles.find((p) => p.bin === percentile).value : undefined;
    return {
      key,
      leftValue,
      rightValue,
      percentageChange: (leftValue && rightValue) ? percentChange(leftValue, rightValue) : undefined,
    };
  });
}

$: if (leftLabel || rightLabel || keySet) displayValues = createNewPercentiles();

</script>

<style>

.summary {
  padding-top: 20px;
  padding-bottom: var(--space-2x);
  max-width: 345px;
  width: 100%;
}

table {
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
  text-transform:uppercase;
  vertical-align: top;
  border-bottom: var(--heavy-border);
  font-size: var(--text-01);
  color: var(--cool-gray-500);
}

td, th {
  padding-left: var(--space-base);
  padding-right: var(--space-base);
  /* min-width: var(--space-4x);
  max-width: var(--space-6x); */
  text-align: right;
  padding-top: var(--space-base);
  padding-bottom: var(--space-base);
  transition: opacity 100ms;
}

.ref, .hov {
  width: 50%;
}

.summary-label--main-date {
  font-family: var(--main-mono-font); 
  color: var(--cool-gray-500); 
  font-weight: bold;
}

.hidden {
  opacity: .2;
}

/* .value-label, .value-left, .value-right {
  text-align: right;
} */


.value-left, .value-right {
  background-color: var(--cool-gray-050);

}

.small-shape {
  padding-left:var(--space-1h);
}

</style>

<div class=summary>

  <table>
    <thead>

      <tr>

        <th style="min-width: 54px; width: max-content">Perc.</th>

            {#if showLeft}
            <!-- keep the comparison if more than one data point -->
            <!-- FIXME: let's move to slots here -->
            <th class:hidden={!hovered} class="summary-label ref">
                <slot name='left-label'>
                  <div>
                    <slot name='left-label-text'>
                      {leftLabel || ''}
                    </slot>
                    {#if hovered}<span class='small-shape'>●</span>{/if}
                  </div>
                  <!-- {#if dataVolume > 2}
                    Hovered
                  {/if} -->
              </slot>
            </th>
            {/if}


        <!-- FIXME: let's move to slots here -->
        {#if showRight}
        <th class="summary-label hov">
          <slot name='right-label'>
            <div>
              <slot name='right-label-text'>
                {rightLabel || ''}
              </slot>
            <span class='small-shape'>⭑</span></div>
            <!-- {#if dataVolume > 2}Ref.{/if} -->
          </slot>
        </th>
        {/if}
        
        {#if showDiff}
          <th  style="width: max-content" class:hidden={!hovered}>Diff.</th>
        {/if}

      </tr>

    </thead>
    <tbody>
          {#each displayValues as {leftValue, rightValue, percentageChange, key}}
            <tr>
              <td  style="width: max-content" class=value-label>
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