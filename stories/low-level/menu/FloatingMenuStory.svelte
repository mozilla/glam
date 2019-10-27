<script>
import FloatingMenu from '../../../src/components/menu/FloatingMenu.svelte';
import MenuList from '../../../src/components/menu/MenuList.svelte';
import MenuListItem from '../../../src/components/menu/MenuListItem.svelte';

let v = 'select something from the menu';
let k = 'nothing';

let on = false;
let parent;
let offset = 16;

function setValue(evt) {
  v = evt.detail.value;
  k = evt.detail.key;
  on = false;
}

</script>

<style>
.parent {
  border: 1px solid var(--cool-gray-200);
  padding: var(--space-2x);
  width: max-content;
  margin-left: var(--space-16x);
}



</style>
<div>
<div class=story style="min-height:600px; height: 600px">
  <h1 class=story__title>Floating Menus</h1>
  <input type=checkbox bind:checked={on}  />
  <input bind:value={offset} /> Offset
  <div style="margin-bottom: var(--space-2x);">
      {k}: {v}
    </div>
  <div class=parent bind:this={parent}>this is the element that the floating menu is "attached" to.</div>

  {#if on}
  <FloatingMenu on:cancel={() => { on = false; }} parent={parent} offset={+offset}>
    <MenuList on:selection={setValue}>
      <MenuListItem  key='first' value={0}>first item</MenuListItem>
      <MenuListItem  key='second' value={1}>second item</MenuListItem>
      <MenuListItem  key='third' value={2}>third item</MenuListItem>
    </MenuList>
  </FloatingMenu>
  {/if}
</div>
</div>