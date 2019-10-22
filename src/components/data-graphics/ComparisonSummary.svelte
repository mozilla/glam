<script>
import ComparisonMultiple from './ComparisonMultiple.svelte';

export let left;
export let right;
export let percentiles;
export let compareTo = 'left-right';

</script>

<style>

table {
  font-size: var(--text-02);
}

th {
  line-height: 1;
}

td, th {
  min-width: var(--space-8x);
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
  text-align: right;
  font-family: var(--main-mono-font); 
  color: var(--cool-gray-500); 
  font-weight: bold;
}


/* .value-label, .value-left, .value-right {
  text-align: right;
} */

</style>
<!-- 
<div class=summary>
    {#each [[left, 'hovered'], [right, 'latest']] as [focus, label], i}
      <div class=summary-percentiles>
        {#if focus}
          <div class='summary-percentile--full'>
            {label}
          </div>
          <div class='summary-percentile--full' style="border-bottom: 1px solid var(--cool-gray-300)">
              <span style="text-align: right;font-family: var(--main-mono-font); color: var(--cool-gray-500); font-weight: bold" >
                  {focus.label.slice(0, 4)}-{focus.label.slice(4,
                  6)}-{focus.label.slice(6, 8)}{' '}</span> 
                <span> {focus.label.slice(8, 10)}:</span>
                <span>{focus.label.slice(10, 12)}:</span>
                <span>{focus.label.slice(12, 14)}</span>
          </div>
          <div class=summary-percentile--bin>
              # profiles
            </div>
            <div class=summary-percentile--value>
              {focus.audienceSize}
            </div>
          {#each percentiles as percentile, i (percentile)}
            <div class=summary-percentile--bin>
                {percentile}th %
              </div>
              <div class=summary-percentile--value>
                <div>
                  {focus.percentiles.find((p) => p.bin === percentile).value}
                </div>
                <div>
                    {focus.percentiles.find((p) => p.bin === percentile).value}
                  </div>
              </div>
          {/each}
        {/if}
      </div>
    {/each}
  </div> -->


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
            <td class=value-left>{left ? left.audienceSize : ' '}</td>
            <td class=value-right>{right ? right.audienceSize : ' '}</td>
          </tr>
          {#each percentiles as percentile}
            <tr>
              <td class=value-label>{percentile}%</td>
              <td class=value-left>{left ? left.percentiles.find((p) => p.bin
              === percentile).value : ' '}</td>
              <td class=value-right>{right ? right.percentiles.find((p) => p.bin
                  === percentile).value : ' '}</td>
            </tr>
          {/each}
    </tbody>
  </table>

  <!-- <ComparisonMultiple label="hovered" buildID={left ? left.label : ' '} datum={left}
  percentiles={percentiles} active={left !== undefined} />
  <ComparisonMultiple label="latest" buildID={right.label} datum={right}
  percentiles={percentiles} active={true} /> -->
</div>