<script>
  import { store } from '../../state/store';
</script>

<style>
  .glean {
    color: var(--pantone-red-600);
    font-weight: 300;
    font-size: 0.8em;
  }
</style>

<h2 class="probe-details-title">
  {$store.route.view}
  /
  <span>{$store.probe.name}</span>
  {#if $store.product === 'fog'}
    <span class="glean">(GLEAN)</span>
  {/if}
</h2>
