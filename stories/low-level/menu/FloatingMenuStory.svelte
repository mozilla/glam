<script>
  import FloatingMenu from "../../../src/components/menu/FloatingMenu.svelte";
  import MenuList from "../../../src/components/menu/MenuList.svelte";
  import MenuListItem from "../../../src/components/menu/MenuListItem.svelte";

  let v = "select something from the menu";
  let k = "nothing";

  let on = false;
  let parent;
  let offset = 16;

  let TB = ["top", "bottom"];
  let LR = ["left", "right"];
  let mainLocation = "top";
  let mainAlignment = "right";

  $: if (TB.includes(mainLocation) && TB.includes(mainAlignment)) {
    mainAlignment = "left";
  }

  $: if (LR.includes(mainLocation) && LR.includes(mainAlignment)) {
    mainAlignment = "bottom";
  }

  function setValue(evt) {
    v = evt.detail.value;
    k = evt.detail.key;
    on = false;
  }

  function isDisabled(v) {
    return (
      (TB.includes(v) && TB.includes(mainLocation)) ||
      (LR.includes(v) && LR.includes(mainLocation))
    );
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
  <div class="story" style="min-height:600px; height: 600px">
    <h1 class="story__title">Floating Menus</h1>
    {mainLocation}-{mainAlignment}
    <input bind:value={offset} />
    Offset
    <table>
      <thead>
        <tr>
          <th>location</th>
          <th>alignment</th>
        </tr>
      </thead>
      <tbody>
        {#each ['bottom', 'top', 'left', 'right'] as v}
          <tr>
            <td>
              <label>
                <input type="radio" bind:group={mainLocation} value={v} />
                {v}
              </label>
            </td>
            <td>
              <label
                style=" color: {isDisabled(v, mainAlignment) ? 'gray' : 'black'};
                transition: color 200ms; ">
                <input
                  type="radio"
                  bind:group={mainAlignment}
                  value={v}
                  disabled={isDisabled(v, mainAlignment)} />
                {v}
              </label>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div style="margin-bottom: var(--space-2x);">{k}: {v}</div>
    <button
      on:click={() => {
        on = true;
      }}
      class="parent"
      bind:this={parent}>
      this is the element that the floating menu is "attached" to. Click it ~
    </button>

    {#if on}
      <FloatingMenu
        location={mainLocation}
        alignment={mainAlignment}
        on:cancel={() => {
          on = false;
        }}
        {parent}
        offset={+offset}>
        <MenuList on:selection={setValue}>
          <MenuListItem key="first" value={0}>first item</MenuListItem>
          <MenuListItem key="second" value={1}>second item</MenuListItem>
          <MenuListItem key="third" value={2}>third item</MenuListItem>
        </MenuList>
      </FloatingMenu>
    {/if}
  </div>
</div>
