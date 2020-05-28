<script>
  import MenuList from 'udgl/menu/MenuList.svelte';
  import MenuListItem from 'udgl/menu/MenuListItem.svelte';

  let v = 'select something from the menu';
  let k = 'nothing';
  let compact = false;
  let dark = false;
  function setValue(evt) {
    v = evt.detail.value;
    k = evt.detail.key;
  }

  let on = true;
</script>

<div class="story" style="min-height:600px; height: 600px">
  <h1 class="story__title">Basic Menus</h1>
  <div>
    <input type="checkbox" bind:checked={on} />
    active
  </div>
  <div>
    <input type="checkbox" bind:checked={compact} />
    compact
  </div>
  <div>
    <input type="checkbox" bind:checked={dark} />
    dark
  </div>
  <div style="margin-bottom: var(--space-2x);">{k}: {v}</div>
  {#if on}
    <MenuList on:selection={setValue}>
      <MenuListItem {compact} {dark} key="first" value={0}>
        first item
      </MenuListItem>
      <MenuListItem {compact} {dark} key="second" value={1}>
        second item
      </MenuListItem>
      <MenuListItem {compact} {dark} key="third" value={2}>
        third item
      </MenuListItem>
    </MenuList>
  {/if}
</div>
