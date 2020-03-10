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
    if (window.history.pushState) {
      const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${query}`;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  }

  // We need to reference $currentQuery in this block if we want the block to
  // re-run whenever $currentQuery changes. If we were to call
  // updateQueryString() with no arguments and use $currentQuery directly in the
  // implementation of updateQueryString(), the query string would not update
  // when the user uses the menu buttons (Channel, OS, etc.), for example.
  $: if (visible) {
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

  // The page.js documentation implies that this preceding slash is not
  // necessary,[1] but another guide uses it without explanation.[2] It seems
  // that the back button does not work if it's ommitted. If it's included, the
  // back button works but also sometimes triggers a refresh. This could be
  // related to issue #286.[3]
  //
  // [1] https://github.com/visionmedia/page.js/tree/94138d1f3105f9fdb3424f9c0870c1fb90adcd1a#readme
  // [2] https://jackwhiting.co.uk/posts/setting-up-routing-in-svelte-with-pagejs/
  // [3] https://github.com/visionmedia/page.js/issues/286
  page('/*', useComponent(NotFound));

  page.start();
</script>

{#if $store.token}
  <Layout>
    <svelte:component this={component} />
  </Layout>
{/if}
