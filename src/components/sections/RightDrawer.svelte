<script>
  import { rightDrawer } from "../../drawer-transitions";

  export let visible = true;
</script>

<style>

</style>

{#if visible}
  <div transition:rightDrawer={{ duration: 200 }} class="drawer right-drawer">
    <slot />
  </div>
{/if}
