<script>
  import MainSelectors from '../../components/regions/MainSelectors.svelte';
  import GLAMMark from '../../components/regions/GLAMMark.svelte';
  import Footer from '../../components/regions/Footer.svelte';
  import Search from '../../components/search/Search.svelte';
  import ProbeViewControl from '../../components/controls/ProbeViewControl.svelte';
  import ProbeDetails from '../../components/regions/ProbeDetails.svelte';
  import SlackLogo from '../../components/icons/SlackLogo.svelte';
  import AlertNotice from '../../components/controls/AlertNotice.svelte';
  import ProductSelector from '../../components/controls/ProductSelector.svelte';

  import { store } from '../../state/store';
  import routes from '../../config/routes';

  $: isProbeDetailsView = $store.route.section === 'probe';

  const defaultTitle = 'GLAM: Glean Aggregated Metrics Explorer';
  $: title =
    $store.route.section === 'probe'
      ? `${$store.probeName} | GLAM`
      : defaultTitle;
</script>

<style>
  .temporary-link-button {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    color: var(--digital-blue-200);
    text-decoration: none;
    font-size: var(--text-015);
    padding: var(--space-1h) var(--space-base);
    border-radius: var(--space-1h);
    grid-gap: var(--space-1h);
    transition: background-color 100ms;
  }

  .temporary-link-button:hover {
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="app">
  <header class="app--toolbar">
    <GLAMMark />
    <Search />
    <ProductSelector />
    <div style="justify-self: end; padding-right: var(--space-2x)">
      <a
        target="_blank"
        class="temporary-link-button"
        href="https://mozilla.slack.com/archives/CB1EQ437S">
        <SlackLogo size="1em" />feedback
      </a>
    </div>
  </header>
  <div class="content">
    <header class="content--header">
      <ProbeViewControl />
      <MainSelectors />
    </header>
    <main class="content--body">
      <div class="graphic-body" class:graphic-body-home={!isProbeDetailsView}>
        <slot />
        {#if isProbeDetailsView}
          <!-- Mark up the probe details here so that they don't re-animate when
               the user switches between the Explore page and the Table page -->
          <div class="graphic-body__details">
            <ProbeDetails>
              {#if $store.product}
                <svelte:component this={routes[$store.product].details} bla={$store.product} />
              {/if}
            </ProbeDetails>
          </div>
        {/if}
      </div>
    </main>
    <footer class="content--footer">
      <Footer />
    </footer>
  </div>
  <AlertNotice toggleKey="dataErrorsWarning">
    <p>Thank you for testing the GLAM prototype!</p>
    <p>
      This tool is still in active development so UX bugs and data issues may
      exist. Help us make it suit your needs by directing questions or feedback
      to the
      <a href="https://app.slack.com/client/T027LFU12/CB1EQ437S">#glam</a>
      Slack channel.
    </p>
  </AlertNotice>
</div>
