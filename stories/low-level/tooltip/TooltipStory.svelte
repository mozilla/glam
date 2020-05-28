<script>
  import Button from 'udgl/Button.svelte';
  import { tooltip } from 'udgl/utils/tooltip';
</script>

<style>
  .first {
    width: 200px;
    height: 150px;
    outline: 1px solid var(--cool-gray-300);
    border: 1px solid blue;
  }
</style>

<div class="story">
  <h1 class="story__title">Tooltips</h1>
  <div use:tooltip={{ text: 'tooltip time', duration: 50 }} class="first">
    This will trigger a tooltip
  </div>

  <span use:tooltip={{ text: "let's try on buttons!" }}>
    <Button>Right on.</Button>
  </span>
</div>
