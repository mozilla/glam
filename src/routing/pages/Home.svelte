<script>
  import { fade } from 'svelte/transition';

  import Button from 'udgl/Button.svelte';
  import MarketingBlock from '../../components/home/MarketingBlock.svelte';
  import whichSmallMultiple from '../../components/home/sm-logic';
  import QuantileSmallMultiple from '../../components/home/Quantile.svelte';
  import ProportionSmallMultiple from '../../components/home/Proportion.svelte';
  import RandomProbePlaceholder from '../../components/home/RandomProbePlaceholder.svelte';
  import { store, currentQuery } from '../../state/store';
  import { getRandomProbes } from '../../state/api';

  // TODO: add this to the upcoming config.js
  const NUMBER_OF_RANDOM_PROBES = 9;
  let randomProbes = getRandomProbes(NUMBER_OF_RANDOM_PROBES, 'parent');
  function refresh() {
    randomProbes = getRandomProbes(NUMBER_OF_RANDOM_PROBES, 'parent');
  }
  $: selectedProcess = $store.productDimensions.process;
</script>

<style>
  .probes-overview {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: var(--space-2x);
    grid-row-gap: var(--space-2x);
  }

  div.placeholder {
    padding: var(--space-2x);
  }

  a.probe-sm {
    display: block;
    color: black;
    padding: var(--space-2x);
    transition: box-shadow 50ms;
  }

  .probe-small-multiple {
    border: 3px solid var(--cool-gray-100);
    border-radius: var(--space-1h);
    background-color: var(--cool-gray-subtle);
    transition: border 200ms;
  }

  a.probe-sm:hover .probe-small-multiple {
    border: 3px solid var(--cool-gray-150);
  }

  .probe-overview {
    margin-top: var(--space-base);
  }

  a.probe-sm:hover {
    text-decoration: none;
  }

  h2 {
    margin: 0;
    padding-left: var(--space-2x);
  }

  .probe-overview__type {
    text-transform: uppercase;
    font-size: var(--text-01);
    color: var(--cool-gray-600);
    letter-spacing: 1px;
    font-weight: 500;
  }

  .probe-overview__title {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    font-size: var(--text-03);
    color: var(--cool-gray-750);
    padding-bottom: var(--space-1h);
    padding-top: var(--space-1h);
    -webkit-box-orient: vertical;
    word-break: break-all;
    overflow: hidden;
  }

  .probe-overview__etc {
    font-size: var(--text-015);
    color: var(--cool-gray-600);
  }

  .random-probe-view {
    margin-top: var(--space-2x);
  }

  h2 {
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    align-items: baseline;
    grid-column-gap: var(--space-base);
    padding-right: var(--space-2x);
  }



</style>

<div class="graphic-body__content">
  <div>
    <MarketingBlock />
    <div class="random-probe-view">
      <h2>Explore
        <div>
          <Button compact level=low on:click={refresh}>refresh</Button>
        </div>
        </h2>
      {#await randomProbes}
        <div class="probes-overview">
          {#each Array.from({ length: NUMBER_OF_RANDOM_PROBES }).fill(null) as _, i}
            <div class="probe-overview__probe placeholder">
              <RandomProbePlaceholder />
            </div>
          {/each}
        </div>
      {:then randomProbes}
        <div class="probes-overview">
          {#each randomProbes.probes as { data, info }, i}
            <div class="probe-overview__probe" in:fade={{ duration: 400 }}>
              <a
                class="probe-sm"
                href={`/firefox/probe/${info.name}/explore${$currentQuery}`}
              >
                <div
                  class="probe-small-multiple"
                  class:probe-small-multiple--proportion={whichSmallMultiple(info.type, info.kind) === 'proportion'}
                  style="min-height:100px;">
                  {#if whichSmallMultiple(info.type, info.kind) === 'quantile'}
                    <QuantileSmallMultiple
                      metricType={info.type}
                      metricKind={info.kind}
                      {data}
                      {info} />
                  {:else if whichSmallMultiple(info.type, info.kind) === 'proportion'}
                    <ProportionSmallMultiple
                      metricType={info.type}
                      metricKind={info.kind}
                      {data}
                      {info} />
                  {/if}
                </div>
                <div class="probe-overview">
                  <div class="probe-overview__type">
                    <span>{info.type}</span>
                    {#if info.kind}•{/if}
                    <span>{info.kind || ''}</span>
                  </div>
                  <div class="probe-overview__title">
                    {info.name}
                  </div>
                  <div class="probe-overview__etc">
                    Nightly {info.versions.nightly[0]}-{info.versions.nightly[1]}
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
      {/await}
    </div>
  </div>
</div>
