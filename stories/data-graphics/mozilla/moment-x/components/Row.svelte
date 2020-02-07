<script>
export let columns = 'auto';
</script>
<style>
div {
  display:grid;
  grid-column-gap: var(--space-2x);
  grid-row-gap: var(--space-4x);
  margin-bottom: var(--space-8x);
}
</style>

<div style="grid-template-columns: {columns};">
  <slot></slot>
</div>