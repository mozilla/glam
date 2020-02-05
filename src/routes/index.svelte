<script>
import Layout from './_layout.svelte';
import GraphicBody from '../components/regions/GraphicBody.svelte';
import { store } from '../state/store';
</script>

{#if $store.token}
  <Layout>
    <!-- NOTE: when migrating to sapper, replace GraphicBody with the default view -->
    <GraphicBody />
  </Layout>
{/if}
