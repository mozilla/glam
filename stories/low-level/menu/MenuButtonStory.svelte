<script>
import MenuButton from '../../../src/components/menu/MenuButton.svelte';
import MenuList from '../../../src/components/menu/MenuList.svelte';
import MenuListItem from '../../../src/components/menu/MenuListItem.svelte';

let value = 0;

function setValue(event) {
  value = event.detail.key;
}

</script>

<div class=story>
<MenuButton>
  <span slot="label">{value}</span>
  <div slot="menu">
    <MenuList  on:selection={setValue}>
        <MenuListItem  key='first' value={0}>first item</MenuListItem>
        <MenuListItem  key='second' value={1}>second item</MenuListItem>
        <MenuListItem  key='third' value={2}>third item</MenuListItem>
      </MenuList>
  </div>
  </MenuButton>

</div>