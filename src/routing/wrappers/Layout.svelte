<script>
  import MainSelectors from '../../components/regions/MainSelectors.svelte';
  import GLAMMark from '../../components/regions/GLAMMark.svelte';
  import Footer from '../../components/regions/Footer.svelte';
  import Search from '../../components/search/Search.svelte';
  import ProbeViewControl from '../../components/controls/ProbeViewControl.svelte';
  import ProbeDetails from '../../components/regions/ProbeDetails.svelte';
  import ProductSelector from '../../components/controls/ProductSelector.svelte';

  import { store } from '../../state/store';
  import routes from '../../config/routes';

  $: isProbeDetailsView = $store.route.section === 'probe';

  const defaultTitle = 'GLAM: Glean Aggregated Metrics Explorer';
  // Use the proper probe name if available (for Glean applications),
  // falling back to the probeName state if not
  $: title =
    $store.route.section === 'probe'
      ? `${$store.probe.name || $store.probeName} | GLAM`
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
        href="https://matrix.to/#/#datatools:mozilla.org"
      >
        <img src="/static/logo.svg" width="18" height="18" alt="Mozilla logo" />
        feedback
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
                <svelte:component
                  this={routes[$store.product].details}
                  bla={$store.product}
                />
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
</div>
