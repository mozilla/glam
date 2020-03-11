<script context="module">
  // We could grab the value of currentQuery here rather than requiring that it
  // be passed as an argument, but that would not cause any links that use this
  // function to update reactively.
  export function getPath(path, query) {
    return query ? `${path}?${query}` : path;
  }

  export function navigate(...args) {
    page.show(getPath(...args));
  }
</script>

<script>
  import page from 'page';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  import { store, currentQuery } from '../state/store';

  // Wrappers
  import Layout from './wrappers/Layout.svelte';

  // Pages
  import Home from './pages/Home.svelte';
  import ProbeExplore from './pages/probe/Explore.svelte';
  import ProbeTable from './pages/probe/Table.svelte';
  import NotFound from './pages/NotFound.svelte';


  let component;
  let visible = false;

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
  // the auth0 client needs to read to authenticate the user.
  $: if (visible && $store.token) {
    updateQueryString($currentQuery);
  }

  onMount(() => {
    visible = true;
  });

  function useComponent(componentToUse, view) {
    return function({ params: { product, section, probeName }}) {
      component = componentToUse;

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

{#if $store.token}
  <Layout>
    <svelte:component this={component} />
  </Layout>
{/if}
