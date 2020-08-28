<script>
  import App from '../../components/regions/App.svelte';
  import Toolbar from '../../components/regions/Toolbar.svelte';
  import Content from '../../components/regions/Content.svelte';
  import ContentHeader from '../../components/regions/ContentHeader.svelte';
  import ContentBody from '../../components/regions/ContentBody.svelte';
  import ContentFooter from '../../components/regions/ContentFooter.svelte';

  import MainSelectors from '../../components/regions/MainSelectors.svelte';
  import GLAMMark from '../../components/regions/GLAMMark.svelte';
  import Footer from '../../components/regions/Footer.svelte';
  import Search from '../../components/search/Search.svelte';
  import ProbeViewControl from '../../components/controls/ProbeViewControl.svelte';
  import ProbeDetails from '../../components/regions/ProbeDetails.svelte';
  import SlackLogo from '../../components/SlackLogo.svelte';
  import AlertNotice from '../../components/controls/AlertNotice.svelte';
  import ProductSelector from '../../components/controls/ProductSelector.svelte';

  import { store } from '../../state/store';
  import routes from '../../config/routes';


  $: isProbeDetailsView = $store.route.section === 'probe';
</script>

<style>
.temporary-link-button {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  color: var(--digital-blue-200);
  text-decoration: none;
  font-size: var(--text-02);
  padding: var(--space-1h) var(--space-base);
  border-radius: var(--space-1h);
  grid-gap: var(--space-base);
  transition: background-color 100ms;
  text-transform: uppercase;
}

.temporary-link-button:hover {
  text-decoration: none;
  background-color: rgba(255,255,255,.1);
}
</style>

<svelte:head>
  {#if $store.route.section === 'probe'}
    <title>{$store.probeName} | GLAM</title>
  {:else}
    <title>GLAM: Glean Aggregated Metrics Explorer</title>
  {/if}
</svelte:head>

<App>
  <Toolbar sticky>
    <GLAMMark />
    <Search />
    <ProductSelector />
    <div style="justify-self: end; padding-right: var(--space-2x)">
      <a target='_blank' class="temporary-link-button" href='https://mozilla.slack.com/archives/CB1EQ437S'>
        <SlackLogo size={16} />feedback
      </a>
    </div>
  </Toolbar>
  <Content centered>
    <ContentHeader>
      <ProbeViewControl />
      <MainSelectors />
    </ContentHeader>
    <ContentBody>
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
    </ContentBody>
    <ContentFooter>
      <Footer />
    </ContentFooter>
  </Content>
  <AlertNotice toggleKey="dataErrorsWarning">
    <p>Thank you for testing the GLAM prototype!</p>
    <p>
      This tool is still in active development so UX bugs and data issues may
      exist. Help us make it suit your needs by directing questions or feedback
      to the <a href="https://app.slack.com/client/T027LFU12/CB1EQ437S">#glam</a> Slack channel.
    </p>
  </AlertNotice>
</App>
