<script>
  import { leftDrawer } from "../../drawer-transitions";

  export let visible = true;
</script>

<style>

</style>

{#if visible}
  <div transition:leftDrawer={{ duration: 200 }} class="drawer left-drawer">
    <slot />
  </div>
{/if}
