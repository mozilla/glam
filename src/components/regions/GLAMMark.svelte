<script>
import { tooltip } from 'udgl/utils/tooltip';
import Logo from 'udgl/icons/GLAM.svelte';
import { store, currentQuery } from '../../state/store';
</script>

<style>
  h1 {
    font-family: var(--brand-font);
    padding: 0;
    margin: 0;
    font-size: 1.5em;
    color: var(--cool-gray-100);
    display: grid;
    align-items: center;
    align-content: center;
    justify-content: start;
    font-weight: normal;
    grid-column-gap: var(--space-base);
    padding-left: var(--space-2x);
    grid-auto-flow: column;
    cursor: pointer;
  }

  a {
    align-self: center;
    text-decoration: none;
  }
</style>

<a href={`/?${$currentQuery}`} on:click={store.reset}>
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
