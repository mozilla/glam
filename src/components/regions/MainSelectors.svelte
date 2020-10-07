<script>
  import { fly } from 'svelte/transition';
  import { CaretDown } from '@graph-paper/icons';
  import { MenuList, MenuListItem } from '@graph-paper/menu';
  import DimensionMenu from '../controls/DimensionMenu.svelte';
  import productConfig from '../../config/products';
  import { store, productConfigDimensions } from '../../state/store';

  const OFFSET = 10;
</script>

<style>
  .main-filters {
    display: grid;
    grid-auto-flow: column;
    grid-column-gap: var(--space-base);
    align-items: center;
    justify-self: end;
  }

  .main-filter__label {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    grid-column-gap: var(--space-1h);
    font-weight: 500;
  }

  .pull-right-edge {
    margin-right: calc(var(--space-1h) * -1);
    display: grid;
    align-items: center;
  }

  .main-filter__label__dimension {
    text-transform: uppercase;
    padding-right: var(--space-1q);
    color: var(--digital-blue-600);
    font-weight: 300;
  }

  .main-filter__label__dimension:after {
    content: ' / ';
    padding-left: var(--space-1q);
    color: var(--cool-gray-400);
  }
</style>

{#if $store.route.section === 'probe' && $store.probe.loaded}
  <div transition:fly={{ x: 5, duration: 200 }} class="main-filters">
    {#each Object.values(productConfig[$store.product].dimensions) as dimension}
      {#if dimension.values.some((di) => dimension.isValidKey === undefined || dimension.isValidKey(di.key, $store.probe, store))}
        <DimensionMenu
          tooltip="Select a {dimension.title}"
          offset={OFFSET}
          location="bottom"
          alignment="right">
          <div class="main-filter__label" slot="label">
            <span class="main-filter__label__dimension">{dimension.title}</span>
            {productConfigDimensions.dimensionValueLabel(dimension.key, $store.productDimensions[dimension.key])}
            <div class="pull-right-edge">
              <CaretDown size="14" />
            </div>
          </div>
          <div slot="menu">
            <MenuList
              on:selection={(event) => {
                store.setDimension(dimension.key, event.detail.key);
              }}>
              {#each dimension.values.filter((di) => dimension.isValidKey === undefined || dimension.isValidKey(di.key, $store.probe, store)) as { key, label }, i (key)}
                <MenuListItem {key} value={key}>
                  <span class="story-label
                  first" />{label}
                </MenuListItem>
              {/each}
            </MenuList>
          </div>
        </DimensionMenu>
      {/if}
    {/each}
  </div>
{/if}
