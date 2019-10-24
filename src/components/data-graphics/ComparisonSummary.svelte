<script>
import { format } from 'd3-format';

import { percentileLineColorMap } from './utils/color-maps';


let fmt = format(',.2r');
let pFmt = format('.0%');

export let left;
export let right;
export let leftLabel;
export let rightLabel;
export let percentiles;
export let compareTo = 'left-right';

function percentChange(l, r) {
  return (r - l) / l;
}

let displayValues = [];

function createNewPercentiles() {
  return percentiles.map((percentile) => {
    const leftValue = left ? left.percentiles.find((p) => p.bin === percentile).value : undefined;
    const rightValue = right ? right.percentiles.find((p) => p.bin === percentile).value : undefined;
    return {
      percentile,
      leftValue,
      rightValue,
      percentageChange: (leftValue && rightValue) ? percentChange(leftValue, rightValue) : undefined,
    };
  });
}

$: if (leftLabel || rightLabel) displayValues = createNewPercentiles();

</script>

<style>

table {
  font-size: var(--text-02);
}

th {
  line-height: 1;
}

td, th {
  text-align: right;
}
/* 
.label {
  font-size: 12px;
} */

.summary-label {
  font-size: 12px;
}

.summary-label--main-date {
  font-family: var(--main-mono-font); 
  color: var(--cool-gray-500); 
  font-weight: bold;
}


/* .value-label, .value-left, .value-right {
  text-align: right;
} */

.summary-color-label {
  display: inline-block;
  width: var(--space-base);
  height: var(--space-base);
  border-radius: var(--space-1q);
}

</style>

<div class=summary>

  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th class=summary-label>
            {#if left}
            Hovered
            <!-- <div class="summary-label--main-date" >
                {left.label.slice(0, 4)}-{left.label.slice(4,
                6)}-{left.label.slice(6, 8)}{' '}</div> 
              {left.label.slice(8, 10)}:... -->
              <!-- {left.label.slice(10, 12)}:{left.label.slice(12, 14)} -->
            {:else}
              <div></div>
            {/if}
        </th>
        <th class=summary-label>
            Latest Build
            <!-- <div class="summary-label--main-date" >
                {right.label.slice(0, 4)}-{right.label.slice(4,
                6)}-{right.label.slice(6, 8)}{' '}</div> 
              {right.label.slice(8, 10)}:{right.label.slice(10, 12)}:{right.label.slice(12, 14)} -->
          </th>
      </tr>
    </thead>
    <tbody>
          <tr>
            <td class=value-label># clients</td>
            <td class=value-left>{left ? fmt(left.audienceSize) : ' '}</td>
            <td class=value-right>{right ? fmt(right.audienceSize) : ' '}</td>
            <td class=value-right>{(left && right)
            ? pFmt(percentChange(left.audienceSize, right.audienceSize)) : ' '}</td>
          </tr>

          {#each displayValues as {leftValue, rightValue, percentageChange, percentile}}
            <tr>
              <td class=value-label>
                <span class='summary-color-label'
                style="background-color:{percentileLineColorMap(percentile)}"></span>
                {percentile}%</td>
              <td class=value-left>{left ? fmt(leftValue) : ' '}</td>
              <td class=value-right>{right ? fmt(rightValue) : ' '}</td>
                  <td class=value-right>{percentageChange ? pFmt(percentageChange) : ' '}</td>
            </tr>
          {/each}
          <!-- {#each percentiles as percentile}
            <tr>
              <td class=value-label>
                <span class='summary-color-label'
                style="background-color:{percentileLineColorMap(percentile)}"></span>
                {percentile}%</td>
              <td class=value-left>{left ? fmt(left.percentiles.find((p) => p.bin
              === percentile).value) : ' '}</td>
              <td class=value-right>{right ? fmt(right.percentiles.find((p) => p.bin
                  === percentile).value) : ' '}</td>
                  <td class=value-right>{(left && right)
                      ? percentChange(left.percentiles.find((p) => p.bin
                      === percentile).value, right.percentiles.find((p) => p.bin
                      === percentile).value) : ' '}</td>
            </tr>
          {/each} -->
    </tbody>
  </table>

  <!-- <ComparisonMultiple label="hovered" buildID={left ? left.label : ' '} datum={left}
  percentiles={percentiles} active={left !== undefined} />
  <ComparisonMultiple label="latest" buildID={right.label} datum={right}
  percentiles={percentiles} active={true} /> -->
</div>