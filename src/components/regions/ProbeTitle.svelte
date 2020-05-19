<script>
  import { store } from '../../state/store';
</script>

<style>
  .probe-details-title {
    margin-top: var(--space-2x);
  }

  .probe-details-title--padded {
    padding-left: var(--space-4x);
  }
</style>

<h2 class="probe-details-title" class:probe-details-title--padded={$store.route.view === 'table'}>
  {$store.route.view} / <span>{$store.probeName}</span>
</h2>
