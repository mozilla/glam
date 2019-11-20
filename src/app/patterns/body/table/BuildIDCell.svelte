<script>
  export let label;
</script>

<style>
  .data-cell__build-id {
    font-family: var(--main-mono-font);
  }

  .data-cell__build-id__date {
    font-weight: bold;
    color: var(--cool-gray-500);
  }
</style>

<td class="data-cell data-cell--main">
  <div class="data-cell__build-id">
    <div class="data-cell__build-id__date">
      <span>{label.slice(0, 4)}</span>
      -
      <span>{label.slice(4, 6)}</span>
      -
      <span>{label.slice(6, 8)}</span>
    </div>
    <div>{label.slice(8, 10)}:{label.slice(10, 12)}:{label.slice(12, 14)}</div>
  </div>
</td>
