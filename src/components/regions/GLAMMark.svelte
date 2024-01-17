<script>
  import { tooltip as tooltipAction } from '@graph-paper/core/actions';
  import Logo from '../icons/GLAMLogo.svelte';
  import Text from '../icons/GLAMText.svelte';
  import { store } from '../../state/store';

  // GLAM logo will resize if screen size
  // is smaller than the viewport min width
  let viewportMinWidth = 1045;
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

<a href={`/`} on:click={store.reset}>
  <h1
    use:tooltipAction={{
      text: 'The Glean Aggregated Metrics Dashboard',
      distance: 16,
    }}
  >
    <Logo {viewportMinWidth} />
    <Text {viewportMinWidth} />
  </h1>
</a>
