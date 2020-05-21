<script>
  export let color;
</script>

<style>
  .color-swatch {
    border-radius: var(--space-1q);
    width: calc(var(--space-base) * 1.5);
    height: calc(var(--space-base) * 1.5);
  }
</style>

<div class="color-swatch" style="background-color: {color}" />
