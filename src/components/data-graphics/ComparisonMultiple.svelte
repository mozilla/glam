<script>

export let label;
export let buildID;
export let active = true;
export let datum;
export let percentiles;

</script>

<style>

.summary-percentiles {
  display: grid;
  grid-template-columns: max-content 1fr;
  font-size: var(--text-01);
  align-content: start;
}

.summary-percentile--full {
  grid-column: 1 / 3;
}

.summary-percentile--bin {
  text-align: right;
  font-weight: bold;
  text-transform: uppercase;
}

.summary-percentile--value {
  justify-self: stretch;
  text-align: right;
  width: 100%;
  /* height: calc(var(--text-01) * 2  * 1.5); */
}
</style>

<div class=summary-percentiles>
    {#if active}
      <div class='summary-percentile--full'>
        {label}
      </div>
      <div class='summary-percentile--full' style="border-bottom: 1px solid var(--cool-gray-300)">
          <span style="text-align: right;font-family: var(--main-mono-font); color: var(--cool-gray-500); font-weight: bold" >
              {buildID.slice(0, 4)}-{buildID.slice(4,
              6)}-{buildID.slice(6, 8)}{' '}</span> 
            <span> {buildID.slice(8, 10)}:</span>
            <span>{buildID.slice(10, 12)}:</span>
            <span>{buildID.slice(12, 14)}</span>
      </div>
      <div class=summary-percentile--bin>
          # profiles
        </div>
        <div class=summary-percentile--value>
          {datum.audienceSize}
        </div>
      {#each percentiles as percentile, i (percentile)}
        <div class=summary-percentile--bin>
            {percentile}th %
          </div>
          <div class=summary-percentile--value>
            <div>
              {datum.percentiles.find((p) => p.bin === percentile).value}
            </div>
          </div>
      {/each}
    {/if}
  </div>