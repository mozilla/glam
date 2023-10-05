<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';

  import LookerLogo from './icons/LookerLogo.svelte';

  export let product;
  export let variants;
  export let sendInPings;
  export let channel;

  let variant;
  let lookerURL;
  let helpText;

  $: {
    variant = variants && variants.find((el) => el.channel === channel);

    lookerURL =
      variant &&
      variant.etl.ping_data[sendInPings] &&
      variant.etl.ping_data[sendInPings].looker &&
      variant.etl.ping_data[sendInPings].looker.metric.url;

    helpText =
      (lookerURL && 'Explore this metric in Looker.') ||
      (product === 'firefox' &&
        'Looker is only available for Glean applications.') ||
      'Currently this metric is not yet supported in Looker.';
  }
</script>

<style>
  .docs-button {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: transparent;
    display: grid;
    width: 100%;
    color: var(--digital-blue-500);
    border: none;
    cursor: pointer;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    text-decoration: none;
    justify-content: center;
    grid-column-gap: var(--space-base);
    text-transform: uppercase;
    font-size: var(--text-015);
    font-weight: 500;
    padding: var(--space-base);
    transition: background-color 100ms;
    border-radius: var(--space-1h);
  }
  .docs-button:hover {
    background-color: var(--cool-gray-150);
  }
  .docs-button a {
    text-decoration: none;
    color: var(--digital-blue-500);
  }

  .docs-button.disabled a {
    color: var(--cool-gray-350);
  }
  .docs-button.disabled:hover {
    background-color: transparent;
  }
</style>

<button
  class="docs-button {!lookerURL && 'disabled'}"
  disabled={!lookerURL}
  use:tooltipAction={{
    text: helpText,
  }}
>
  <LookerLogo disabled={!lookerURL} />
  <a href={lookerURL} target="_blank">View in Looker</a>
</button>
