<script>
import { tooltip } from 'udgl/utils/tooltip';
import Logo from 'udgl/icons/GLAM.svelte';
import { store, currentQuery } from '../../state/store';
import { getPath } from '../../routing/Router.svelte';
</script>

<style>
h1 {
    cursor: pointer;
}

a {
  align-self: center;
  text-decoration: none;
}
</style>

<a href={getPath('/', $currentQuery)} on:click={store.reset}>
  <h1>
    <Logo />
    <div use:tooltip={{
      text: 'The Glean Aggregated Metrics Dashboard',
      distance: 16,
    }}>
      GLAM
    </div>
  </h1>
</a>
