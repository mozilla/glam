<script>
import ComparisonMultiple from './ComparisonMultiple.svelte';

export let left;
export let right;
export let percentiles;
export let compareTo = 'left-right';
console.log(left, right, percentiles);
</script>

<style>

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: var(--space-base);
  width: var(--space-40x);
}


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
  <ComparisonMultiple label="hovered" buildID={left ? left.label : ' '} datum={left}
  percentiles={percentiles} active={left !== undefined} />
  <ComparisonMultiple label="latest" buildID={right.label} datum={right}
  percentiles={percentiles} active={true} />
  </div>