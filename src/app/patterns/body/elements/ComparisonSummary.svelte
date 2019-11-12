<script>
import { format } from 'd3-format';


let fmt = format(',.4r');
let pFmt = format('.0%');

export let colorMap = () => 'black';
export let left;
export let right;
export let leftLabel;
export let rightLabel;
export let keySet;
export let compareTo = 'left-right';
export let valueFormatter = (t) => t;
export let keyFormatter = (t) => t;

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
  padding-top: var(--space-2x);
  padding-bottom: var(--space-2x);
}

table {
  font-family: var(--main-mono-font);
  font-size: var(--text-015);
  /* margin-left: var(--space-base); */
  margin: auto;
  /* width: 100%; */
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
  /* min-width: var(--space-4x);
  max-width: var(--space-6x); */
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


.left-value, .right-value {
  background-color: var(--cool-gray-100);

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
        </th>
        <th class=summary-label>
            Latest<span class='small-shape'>⭑</span>
          </th>
          <th>Diff.</th>
      </tr>
    </thead>
    <tbody>
          {#each displayValues as {leftValue, rightValue, percentageChange, key}}
            <tr>
              <td class=value-label>
                <span class=percentile-label-block
                style="background-color:{colorMap(key)}"></span>{keyFormatter(key)}</td>
              <td class=value-left>{left ? valueFormatter(leftValue) : ' '}</td>
              <td class=value-right>{right ? valueFormatter(rightValue) : ' '}</td>
              <td class=value-change>{percentageChange ? pFmt(percentageChange) : ' '}</td>
            </tr>
          {/each}
    </tbody>
  </table>
</div>