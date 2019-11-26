<script>
  export let level = 'info';
</script>

<style>

.status-label {
  font-size: var(--text-015);
}

.status-label span {
  display: inline-block;
  padding: calc(var(--space-1h) - 1px) var(--space-base) var(--space-1h);
  border-radius: calc(var(--space-base) * 1.5);
  letter-spacing: 0.5px;
}

.status-label-success span {
  /* TODO: good candidate for semantic naming like --color-status-on */ 
  color: var(--mantis-green-800);
  background-color: var(--mantis-green-200);
}

.status-label-info span {
  color: var(--cool-gray-600);
  background-color: var(--cool-gray-200);
}

.status-label-error span {
  color: var(--pantone-red-700);
  background-color: var(--pantone-red-200);
}

.status-label-warning span {
  color: var(--bright-yellow-700);
  background-color: var(--bright-yellow-200);
}

</style>

<div class="status-label {`status-label-${level}`}">
  <span><slot></slot></span>
</div>