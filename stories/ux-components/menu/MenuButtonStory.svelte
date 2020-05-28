<script>
  import MenuButton from 'udgl/menu/MenuButton.svelte';
  import MenuList from 'udgl/menu/MenuList.svelte';
  import MenuListItem from 'udgl/menu/MenuListItem.svelte';
  import DownCarat from 'udgl/icons/DownCarat.svelte';

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
    margin-right: var(--space-base);
    border-radius: var(--space-1q);
  }

  .menu-label-example {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
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

<div class="story story--dark">
  <h1 class="story__title">Menu Button</h1>
  <div>
    <MenuButton level="medium">
      <div class="menu-label-example" slot="label">
        <span class="story-label {key}" />
        {key}
        <span style="display: grid;">
          <DownCarat size="16" />
        </span>
      </div>
      <div slot="menu">
        <MenuList on:selection={setValue}>
          <MenuListItem compact key="first" value={0}>
            <span class="story-label first" />
            first item
          </MenuListItem>
          <MenuListItem compact key="second" value={1}>
            <span class="story-label second" />
            second item
          </MenuListItem>
          <MenuListItem compact key="third" value={2}>
            <span class="story-label third" />
            third item
          </MenuListItem>
        </MenuList>
      </div>
    </MenuButton>
  </div>
</div>
