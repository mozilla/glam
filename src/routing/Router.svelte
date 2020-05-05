<script>
  import page from 'page';
  import Spinner from 'udgl/LineSegSpinner.svelte';
  import { onMount } from 'svelte';

  import productConfig from '../config/products';
  import { store, currentQuery } from '../state/store';
  import { probeSet } from '../state/telemetry-search';
  import { codeAndStateInQuery } from '../utils/url';

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
      const newURL = `${window.location.origin}${window.location.pathname}?${query}`;
      window.history.replaceState(null, null, newURL);
    }
  }

  // We need to reference $currentQuery in this block if we want the block to
  // run whenever $currentQuery changes. If we were to call updateQueryString()
  // with no arguments and use $currentQuery in the implementation of
  // updateQueryString(), this block would never run and the query string would
  // therefore never update in response to the user activity.
  //
  // We also need to avoid running this block whenever the code= and state= keys
  // are in the query, otherwise we would clobber them. Auth0 needs to read them
  // to authenticate the user.
  $: if (visible && !codeAndStateInQuery()) {
    updateQueryString($currentQuery);
  }

  onMount(() => {
    visible = true;
  });

  function useComponent(componentToUse, view) {
    return function handle({ params: { product, section, probeName } }) {
      component = componentToUse;

      // Issue #355: Update the probe here, whenever the path changes, to ensure
      // that clicks to the back/forward buttons work as expected.
      if (probeName) {
        store.setField('probeName', probeName);
        if ($probeSet) {
          const newProbe = $probeSet.find((p) => p.name.toLowerCase() === probeName.toLowerCase());
          productConfig[$store.product].setDefaultsForProbe(store, newProbe);
        }
      }

      store.setField('route', {
        product,
        section,
        probeName,
        view,
      });
    };
  }

  page('/', useComponent(Home));
  page('/:product/:section/:probeName/explore', useComponent(ProbeExplore, 'explore'));
  page('/:product/:section/:probeName/table', useComponent(ProbeTable, 'table'));
  page('*', useComponent(NotFound));

  page.start();
</script>

<Layout>
  {#if $store.auth.isAuthenticated}
    <svelte:component this={component} />
  {:else}
    <div class="graphic-body__content">
      <Spinner size={48} color={'var(--cool-gray-400)'} />
    </div>
  {/if}
</Layout>
