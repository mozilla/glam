<script>
import FloatingMenu from '../../udgl/menu/FloatingMenu.svelte';
import MenuList from '../../udgl/menu/MenuList.svelte';
import MenuListItem from '../../udgl/menu/MenuListItem.svelte';
import DownCarat from '../../udgl/icons/DownCarat.svelte';
import { tooltip as tooltipAction } from '../../udgl/utils/tooltip';

export let aggregationTypes;
export let currentAggregation;
export let active;

let button;
let width;

function toggle() {
  active = !active;
}

function setValue(event) {
  currentAggregation = event.detail.key;
  active = false;
}

// TODO: This is a good candidate for something that should be provided to us by GLEAN.
export let aggregationInfo = {
  avg: { name: 'Average', description: 'Shows the distribution of the average scalar value per client.' },
  min: { name: 'Minimum', description: 'Shows the distribution of the smallest scalar value per client.' },
  max: { name: 'Maximum', description: 'Shows the distribution of the largest scalar value per client.' },
  sum: { name: 'Sum', description: 'Shows the distribution of the sum of scalar values per client.' },
  count: { name: 'Count', description: 'Shows the distribution of session counts per client.' },
};

</script>

<style>

.activating-button {
  padding: var(--space-1h);
  padding-left: var(--space-base);
  padding-right: var(--space-base);
  font-size: var(--text-01);
  margin:0;
  text-align: left;
  /* min-width: var(--space-16x); */
  background-color: white;
  display:grid;
  grid-auto-flow: column;
  width: max-content;
  grid-column-gap: var(--space-base);
  color: var(--subhead-gray-02);
  border-radius: var(--space-1h);
}
.menu-list-item__title {
  font-size: var(--text-015);
}

.menu-list-item__description {
  width: var(--space-24x);
  font-size: var(--text-015);
  color: var(--subhead-gray-01);
}

.active {
  background-color: rgba(0,0,0,.2);
  color: var(--subhead-gray-02);
}

</style>

<div class=menu-button bind:this={button} use:tooltipAction={{ text: 'this probe has multiple aggregation methods – select one from this menu' }}>
  <button class=activating-button on:click={toggle} class:active>
      <div>{aggregationInfo[currentAggregation].name}</div> <DownCarat size=16 />
  </button>
</div>

{#if active}
  <FloatingMenu
    bind:width={width}
    offset={1}
    on:cancel={() => { active = false; }}
    position='bottom-left'
    parent={button}
  >
    <MenuList  on:selection={setValue}>
      {#each aggregationTypes as agg, i}
        <MenuListItem key={agg} value={agg}>
          <div class=menu-list-item__title>{aggregationInfo[agg].name}</div>
          <div class=menu-list-item__description>{aggregationInfo[agg].description}</div>
        </MenuListItem>
      {/each}
    </MenuList>
  </FloatingMenu>
{/if}
