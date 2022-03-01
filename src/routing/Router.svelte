<script>
  import page from 'page';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import productConfig from '../config/products';
  import { store, currentQuery } from '../state/store';
  import { getProbeInfo } from '../state/api';

  // Wrappers
  import Layout from './wrappers/Layout.svelte';

  // Pages
  import Home from './pages/Home.svelte';
  import ProbeExplore from './pages/probe/Explore.svelte';
  import ProbeTable from './pages/probe/Table.svelte';
  import NotFound from './pages/NotFound.svelte';

  let visible = false;
  let component;

  function updateQueryString(query) {
    if (window.history.replaceState) {
      const newURL = `${window.location.origin}${window.location.pathname}${query}`;
      window.history.replaceState(null, null, newURL);
    }
  }

  // We need to reference $currentQuery in this block if we want the block to
  // run whenever $currentQuery changes. If we were to call updateQueryString()
  // with no arguments and use $currentQuery in the implementation of
  // updateQueryString(), this block would never run and the query string would
  // therefore never update in response to the user activity.
  $: if (visible) {
    updateQueryString($currentQuery);
  }

  onMount(() => {
    visible = true;
  });

  function useComponent(componentToUse, view) {
    return function handle({ params: { product, section, probeName } }) {
      const storeValue = get(store);
      component = componentToUse;

      // Issue #355: Update the probe here, whenever the path changes, to ensure
      // that clicks to the back/forward buttons work as expected.
      if (probeName) {
        store.setField('probe', { loaded: false });
        store.setField('probeName', probeName);

        // The canonical probe info fetch. (PSS)
        getProbeInfo($store.searchProduct, probeName, $store.legacy).then((r) => {
          let newProbe = { ...r, loaded: true };

          // if the product has changed,
          // set it in the store and use store.resetProductDimensions()
          // to initialize.
          if (product && storeValue.product !== product) {
            store.setProduct(product);
          }
          store.setField('probe', newProbe);

          if (productConfig[product].transformProbeForGLAM) {
            newProbe = productConfig[product].transformProbeForGLAM(newProbe);
          }
          productConfig[product].setDefaultsForProbe(store, newProbe);
        });
      }

      store.setField('route', {
        product,
        section,
        probeName,
        view,
      });
    };
  }

  // Google Analytics middleware
  page((ctx, next) => {
    gtag('config', '__GA_TRACKING_ID__', {
      page_path: ctx.pathname,
    });
    next();
  });

  page('/', useComponent(Home));
  page(
    '/:product/:section/:probeName/explore',
    useComponent(ProbeExplore, 'explore')
  );
  page(
    '/:product/:section/:probeName/table',
    useComponent(ProbeTable, 'table')
  );
  page('*', useComponent(NotFound));

  page.start();
</script>

<Layout>
  <svelte:component this={component} />
</Layout>
