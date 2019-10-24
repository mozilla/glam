<script>
import MenuButton from '../../../src/components/menu/MenuButton.svelte';
import MenuList from '../../../src/components/menu/MenuList.svelte';
import MenuListItem from '../../../src/components/menu/MenuListItem.svelte';

let key = 'first';

function setValue(event) {
  key = event.detail.key;
}

</script>

<style>


.story-label {
  display: inline-block;
  width: var(--space-base);
  height: var(--space-base);
  margin-right: var(--space-1h);
  border-radius: var(--space-1q);
}

.first {
  background-color: var(--cool-gray-300);
}

.second {
  background-color: var(--pantone-red-400);
}

.third {
  background-color: var(--bright-yellow-400);
}
</style>

<div class=story>
<MenuButton>
  <span slot="label"> <span class='story-label {key}'></span> {key}</span>
  <div slot="menu">
    <MenuList  on:selection={setValue}>
        <MenuListItem  key='first' value={0}><span class='story-label first'></span>first item</MenuListItem>
        <MenuListItem  key='second' value={1}><span class='story-label second'></span>second item</MenuListItem>
        <MenuListItem  key='third' value={2}><span class='story-label third'></span>third item</MenuListItem>
      </MenuList>
  </div>
  </MenuButton>

</div>