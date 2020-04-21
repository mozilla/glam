<script>
  import page from 'page';
  import Spinner from 'udgl/LineSegSpinner.svelte';
  import { onMount } from 'svelte';

  import { store, currentQuery } from '../state/store';
  import { probeSet } from '../state/telemetry-search';
  import productConfig from '../config/products';
  // Wrappers
  import Layout from './wrappers/Layout.svelte';

  // Pages
  import Home from './pages/Home.svelte';
  import ProbeExplore from './pages/probe/Explore.svelte';
  import ProbeTable from './pages/probe/Table.svelte';
  import NotFound from './pages/NotFound.svelte';


  const ssAuthKey = 'relativeURLBeforeAuth';
  let visible = false;
  let handledAuthRedirect = false;
  let component;

  function updateQueryString(query) {
    if (window.history.replaceState) {
      const newURL = `${window.location.origin}${window.location.pathname}?${query}`;
      window.history.replaceState(null, null, newURL);
    }
  }

  // We need to reference $currentQuery in this block if we want the block to
  // re-run whenever $currentQuery changes. If we were to call
  // updateQueryString() with no arguments and use $currentQuery directly in the
  // implementation of updateQueryString(), the query string would not update
  // when the user uses the menu buttons (Channel, OS, etc.), for example.
  //
  // We also need to check that the user is authenticated before doing this,
  // otherwise we risk clobbering the "code" and "state" query parameters that
  // the Auth0 client needs to read to authenticate the user. (Strictly
  // speaking, we don't need to check $store.auth.isAuthenticated here because
  // it should always be true when handledAuthRedirect is true, but it doesn't hurt
  // to double check.)
  $: if (handledAuthRedirect && $store.auth.isAuthenticated && visible) {
    updateQueryString($currentQuery);
  }

  // Route the user back to the page that they attempted to access before
  // authentication began.
  //
  // Auth0 requires that the user be redirected to a true static path after
  // authentication.[1] In our case, the only true static path is the root
  // path. Everything else is handled by the client-side router.
  //
  // That said, we do know what location the user attempted to access before
  // authentiaction began (thanks, auth.js), so we can use this opportunity to
  // send them back there.
  //
  // NB: This is not an HTTP redirect. What page.js calls a redirect is really
  // just a call to History.replaceState.
  //
  // [1] https://bugzilla.mozilla.org/show_bug.cgi?id=1623800#c1
  $: if ($store.auth.isAuthenticated && !handledAuthRedirect) {
    page.redirect(sessionStorage.getItem(ssAuthKey));
    sessionStorage.removeItem(ssAuthKey);
    handledAuthRedirect = true;
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
          const newProbe = $probeSet.find((p) => p.name === probeName);
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
