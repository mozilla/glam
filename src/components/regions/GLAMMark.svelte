<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import Logo from '../icons/GLAMLogo.svelte';
  import Text from '../icons/GLAMText.svelte';
  import { store, currentQuery } from '../../state/store';
</script>

<style>
  h1 {
    cursor: pointer;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
  }

  a {
    align-self: center;
    text-decoration: none;
  }
</style>

<a href={`/${$currentQuery}`} on:click={store.reset}>
  <h1
    use:tooltipAction={{ text: 'The Glean Aggregated Metrics Dashboard', distance: 16 }}>
    <Logo />
    <Text />
  </h1>
</a>
