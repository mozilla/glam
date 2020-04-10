<script>
import MenuButton from 'udgl/menu/MenuButton.svelte';
import MenuList from 'udgl/menu/MenuList.svelte';
import MenuListItem from 'udgl/menu/MenuListItem.svelte';
import DownCarat from 'udgl/icons/DownCarat.svelte';
import CONFIG from '../../config.json';

import {
  store,
  getFieldValueLabel,
} from '../../state/store';

const OFFSET = 10;
const COMPACT = true;
</script>

<style>
.main-filters {
  display:grid;
  grid-auto-flow: column;
  grid-column-gap:var(--space-base);
  align-items: center;
  justify-self: end;
  margin-right: var(--space-4x);
}

.main-filter__label {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  grid-column-gap: var(--space-1h);
}

.pull-right-edge {
  margin-right: calc(var(--space-1h) * -1);
  display: grid;
  align-items: center;
}

</style>

<div class='main-filters'>
  <MenuButton tooltip={'Select a Channel'} compact={COMPACT} offset={OFFSET} location='bottom' alignment='right'>
    <div class=main-filter__label slot="label">{getFieldValueLabel('channel', $store.channel)} <div class=pull-right-edge><DownCarat size=14 /></div></div>
    <div slot="menu">
      <MenuList on:selection={(event) => { store.setField('channel', event.detail.key); }}>
          {#each CONFIG.fields.channel.values as {key, label}, i (key)}
            <MenuListItem  key={key} value={key}><span class='story-label
              first'></span>{label}</MenuListItem>
            {/each}
        </MenuList>
    </div>
  </MenuButton>
  <MenuButton tooltip={'Select an OS'} compact={COMPACT} offset={OFFSET} location='bottom' alignment='right'>
    <div class=main-filter__label slot="label">{getFieldValueLabel('os', $store.os)}<div class=pull-right-edge><DownCarat size=14 /></div></div>
    <div slot="menu">
      <MenuList on:selection={(event) => { store.setField('os', event.detail.key); }}>
        {#each CONFIG.fields.os.values as {key, label}, i (key)}
          <MenuListItem  key={key} value={key}><span class='story-label
            first'></span>{label}</MenuListItem>
          {/each}
      </MenuList>
    </div>
  </MenuButton>
  <MenuButton tooltip={'Select an Aggregation Level'} compact={COMPACT}  offset={OFFSET} location='bottom' alignment='right'>
    <div class=main-filter__label slot="label">{getFieldValueLabel('aggregationLevel', $store.aggregationLevel)}<div class=pull-right-edge><DownCarat size=14 /></div></div>
    <div slot="menu">
        <MenuList on:selection={(event) => { store.setField('aggregationLevel', event.detail.key); }}>
          {#each CONFIG.fields.aggregationLevel.values as {key, label}, i (key)}
          <MenuListItem  key={key} value={key}><span class='story-label
            first'></span>{label}</MenuListItem>
          {/each}
        </MenuList>
    </div>
  </MenuButton>
  {#if $store.route.view} <!-- Hide process selector on home page. -->
    <MenuButton tooltip={'Select a Process'} compact={COMPACT}  offset={OFFSET} location='bottom' alignment='left'>
      <div class=main-filter__label slot="label">{getFieldValueLabel('process', $store.process) || 'select a process'}<div class=pull-right-edge><DownCarat size=14 /></div></div>
      <div slot="menu">
          <MenuList on:selection={(event) => { store.setField('process', event.detail.key); }}>
            {#each CONFIG.fields.process.values as {key, label}, i (key)}
            <MenuListItem  key={key} value={key}><span class='story-label
              first'></span>{label}</MenuListItem>
            {/each}
          </MenuList>
      </div>
    </MenuButton>
  {/if}
</div>
