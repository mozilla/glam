<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import { Help } from '@graph-paper/icons';
  import Springable from '../Springable.svelte';

  import { formatPercentDecimal } from '../../utils/formatters';

  export let hovered = false;
  export let colorMap = () => 'black';
  export let left;
  export let right;
  export let leftLabel;
  export let rightLabel;
  export let keySet;
  export let binLabel;
  export let valueFormatter = (t) => t;
  export let keyFormatter = (t) => t;
  export let showLeft = true;
  export let showRight = true;
  export let showDiff = true;

  function percentChange(l, r) {
    return (r - l) / l;
  }

  let displayValues = [];

  function createNewPercentiles(lVal, rVal, ks) {
    return ks.map((key) => {
      const leftValue = lVal ? lVal[key] : undefined;
      const rightValue = rVal ? rVal[key] : undefined;
      return {
        key,
        leftValue,
        rightValue,
        percentageChange:
          leftValue && rightValue
            ? percentChange(leftValue, rightValue)
            : undefined,
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
    grid-row: 1 / span 2;
    grid-column: 3;
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

  tbody tr td:first-child,
  tbody tr td:last-child {
    border-right: var(--heavy-border);
    border-left: var(--heavy-border);
  }

  tbody tr:last-child td {
    border-bottom: var(--heavy-border);
  }

  th {
    font-family: var(--main-text-font);
    line-height: 1;
    font-weight: normal;
    text-transform: uppercase;
    vertical-align: top;
    border-bottom: var(--heavy-border);
    font-size: var(--text-01);
    color: var(--cool-gray-650);
  }

  td,
  th {
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    text-align: right;
    padding-top: var(--space-base);
    padding-bottom: var(--space-base);
    transition: opacity 100ms;
  }

  .ref,
  .hov {
    width: 50%;
  }

  .hidden {
    opacity: 0.2;
  }

  .value-left,
  .value-right {
    background-color: var(--cool-gray-050);
  }

  .small-shape {
    padding-left: var(--space-1h);
  }

  .value-label {
    min-width: calc(var(--space-base) * 7);
    max-width: calc(var(--space-base) * 10);
    overflow-wrap: break-word;
  }

  .value-change {
    min-width: calc(var(--space-6x) + var(--space-base));
    width: max-content;
  }
</style>

<div class="summary">
  <h3 class="data-graphic__element-title">
    Summary
    <span
      use:tooltipAction={{
        text:
          'Compares the numeric values of the reference ⭑ to the hovered values ●',
        location: 'top',
      }}
      class="data-graphic__element-title__icon"><Help size={14} /></span>
  </h3>
  <table>
    <thead>
      <tr>
        <th class="value-label">{binLabel}</th>
        {#if showLeft}
          <th class:hidden={!hovered} class="summary-label ref">
            <div><span class="small-shape">●</span> {leftLabel || ''}</div>
          </th>
        {/if}
        {#if showRight}
          <th class="summary-label hov">
            <div><span class="small-shape">⭑</span> {rightLabel || ''}</div>
          </th>
        {/if}
        {#if showDiff}
          <th style="width: max-content" class:hidden={!hovered}>Diff.</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each displayValues as { leftValue, rightValue, percentageChange, key }, i (key)}
        <tr>
          <!-- FIXME: the tooltip used here causes performance lag due to completely destroy performance.
                If a solution is found for https://github.com/graph-paper-org/graph-paper/issues/52, let's
                bring back the tooltip.
               -->
          <!-- <td class="value-label" use:tooltipAction={{ text: keyFormatter(key), location: 'top' }}>
                <span class=percentile-label-block
                style="background-color: {colorMap(key)};"></span>{keyFormatter(key)}</td> -->

          <td class="value-label">
            <span
              class="percentile-label-block"
              style="background-color: {colorMap(key)};" />{keyFormatter(key)}
          </td>

          {#if showLeft}
            <td class:hidden={!hovered} class="value-left">
              {leftValue !== undefined ? valueFormatter(leftValue) : ' '}
            </td>
          {/if}

          {#if showRight}
            <td class="value-right">
              {#if rightValue !== undefined}
                <Springable value={rightValue} let:springValue>
                  {valueFormatter(springValue)}
                </Springable>
              {:else}{' '}{/if}
            </td>
          {/if}

          {#if showDiff}
            <td class:hidden={!hovered} class="value-change">
              {percentageChange !== undefined
                ? formatPercentDecimal(percentageChange)
                : ' '}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
