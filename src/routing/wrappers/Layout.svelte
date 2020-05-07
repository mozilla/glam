<script>
  import App from 'udgl/layout/App.svelte';
  import Toolbar from 'udgl/layout/Toolbar.svelte';
  import Content from 'udgl/layout/Content.svelte';
  import ContentHeader from 'udgl/layout/ContentHeader.svelte';
  import ContentBody from 'udgl/layout/ContentBody.svelte';
  import ContentFooter from 'udgl/layout/ContentFooter.svelte';

  import MainSelectors from '../../components/regions/MainSelectors.svelte';
  import GLAMMark from '../../components/regions/GLAMMark.svelte';
  import Footer from '../../components/regions/Footer.svelte';
  import Search from '../../components/search/Search.svelte';
  import ProbeViewControl from '../../components/controls/ProbeViewControl.svelte';
  import ProbeDetails from '../../components/regions/ProbeDetails.svelte';
  import SlackLogo from '../../components/SlackLogo.svelte';

  import { store } from '../../state/store';
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

<App>
  <Toolbar sticky>
    <GLAMMark />
    <Search />
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
      <div class="graphic-body">
        <slot />
        {#if $store.route.section === 'probe'}
          <!-- Mark up the probe details here so that they don't re-animate when
               the user switches between the Explore page and the Table page -->
          <div class="graphic-body__details">
            <ProbeDetails />
          </div>
        {/if}
      </div>
    </ContentBody>
    <ContentFooter>
      <Footer />
    </ContentFooter>
  </Content>
</App>
