<script>
import { format } from 'd3-format';

import { percentileLineColorMap } from './utils/color-maps';


let fmt = format(',.4r');
let countFmt = format(',d');
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

$: if (leftLabel || rightLabel || percentiles) displayValues = createNewPercentiles();

</script>

<style>

.summary {
  padding-top: var(--space-2x);
  padding-bottom: var(--space-2x);
}

table {
  font-family: var(--main-mono-font);
  font-size: var(--text-015);
  margin-left: var(--space-base);
  width: 100%;
  border-spacing: 0px;
  --heavy-border: 1px solid var(--line-gray-01);
  --lighter-border: 1px dotted var(--bg-gray-01);
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
  min-width: var(--space-6x);
  max-width: var(--space-8x);
  text-align: right;
  padding-top: var(--space-base);
  padding-bottom: var(--space-base);
}
/* 
.label {
  font-size: 12px;
} */

/* .summary-label {
  font-size: 12px;
} */

.summary-label--main-date {
  font-family: var(--main-mono-font); 
  color: var(--cool-gray-500); 
  font-weight: bold;
}


/* .value-label, .value-left, .value-right {
  text-align: right;
} */

.value-label {
  min-width: var(--space-8x);
}

.left-value, .right-value {
  background-color: var(--cool-gray-100);

}

.summary-color-label {
  display: inline-block;
  width: var(--space-base);
  height: var(--space-base);
  border-radius: var(--space-1q);
  margin-right: var(--space-1h);
}

.small-shape {
  padding-left:var(--space-1h);
}

</style>

<div class=summary>

  <table>
    <thead>
      <tr>
        <th>Perc.</th>
        <th class=summary-label>
            Hovered<span class='small-shape'>●</span>
            <!-- <div class="summary-label--main-date" >
                {left.label.slice(0, 4)}-{left.label.slice(4,
                6)}-{left.label.slice(6, 8)}{' '}</div> 
              {left.label.slice(8, 10)}:... -->
              <!-- {left.label.slice(10, 12)}:{left.label.slice(12, 14)} -->
        </th>
        <th class=summary-label>
            Latest<span class='small-shape'>▲</span>
            <!-- <div class="summary-label--main-date" >
                {right.label.slice(0, 4)}-{right.label.slice(4,
                6)}-{right.label.slice(6, 8)}{' '}</div> 
              {right.label.slice(8, 10)}:{right.label.slice(10, 12)}:{right.label.slice(12, 14)} -->
          </th>
          <th></th>
      </tr>
    </thead>
    <tbody>
          <!-- <tr>
            <td class=value-label style="font-size: var(--text-01);">clients</td>
            <td class=value-left>{left ? countFmt(left.audienceSize) : ' '}</td>
            <td class=value-right>{right ? countFmt(right.audienceSize) : ' '}</td>
            <td></td>
          </tr> -->

          {#each displayValues as {leftValue, rightValue, percentageChange, percentile}}
            <tr>
              <td class=value-label>
                <span class='summary-color-label'
                style="background-color:{percentileLineColorMap(percentile)}"></span>{percentile}%</td>
              <td class=value-left>{left ? fmt(leftValue) : ' '}</td>
              <td class=value-right>{right ? fmt(rightValue) : ' '}</td>
                  <td class=value-change>{percentageChange ? pFmt(percentageChange) : ' '}</td>
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