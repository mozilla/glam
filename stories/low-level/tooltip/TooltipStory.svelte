<script>
import Button from '../../../src/components/Button.svelte';
import { tooltip } from '../../../src/components/utils/tooltip';
</script>

<style>
.first {
  width: 200px;
  height:150px;
  outline: 1px solid var(--cool-gray-300);
  border: 1px solid blue;
}

</style>

<div class=story>
  <h1 class=story__title>Tooltips</h1>
  <div use:tooltip={'tooltip time', { duration: 50 }} class=first>
    This will trigger a tooltip
  </div>

  <span use:tooltip={"let's try on buttons!"}>
    <Button>Right on.</Button>
  </span>
</div>
