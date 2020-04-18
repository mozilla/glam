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

  import { store } from '../../state/store';
</script>

<App>
  <Toolbar sticky>
    <GLAMMark />
    <Search />
    <div style="justify-self: end; padding-right: var(--space-4x); min-width: var(--space-16x);">
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
