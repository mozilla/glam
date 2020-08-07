<script>
  import DimensionMenu from './DimensionMenu.svelte';
  import { store } from '../../state/store';
  import DownCarat from 'udgl/icons/DownCarat.svelte';
  import MenuList from 'udgl/menu/MenuList.svelte';
  import MenuListItem from 'udgl/menu/MenuListItem.svelte';

  const COMPACT = true;
  const OFFSET = 10;

  // FIXME: this belongs in a config.
  const products = [
    {label: 'Firefox', apiKey: 'firefox'},
    {label: 'Fenix', apiKey: 'fenix'},
  ];
</script>

<style>
  .pull-right-edge {
    margin-right: calc(var(--space-1h) * -1);
    display: grid;
    align-items: center;
  }

  .main-filter__label {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    grid-column-gap: var(--space-1h);
    font-weight: 500;
  }

  .product-selector {
    position: relative;
    left: -90px; /* FIXME: this is a bad approach */
  }
</style>

<div class="product-selector">
  <DimensionMenu tooltip="Select a product" compact={COMPACT} offset={OFFSET} location="bottom" alignment="center">
    <div class="main-filter__label" slot="label">
      {products.filter(p => p.apiKey === $store.searchProduct)[0].label}
      <div class="pull-right-edge"><DownCarat size=14 /></div>
    </div>
    <div slot="menu">
      <MenuList on:selection={(event) => { store.setField('searchProduct', event.detail.key); }}>
        {#each products as {label, apiKey}, i (apiKey)}
          <MenuListItem key={apiKey} value={apiKey}>
            <span class="story-label first"></span>{label}
          </MenuListItem>
        {/each}
      </MenuList>
    </div>
  </DimensionMenu>
</div>
