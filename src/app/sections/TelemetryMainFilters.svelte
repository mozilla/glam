<script>
import MenuButton from '../../components/menu/MenuButton.svelte';
import MenuList from '../../components/menu/MenuList.svelte';
import MenuListItem from '../../components/menu/MenuListItem.svelte';
import DownCarat from '../../components/icons/DownCarat.svelte';
import CONFIG from '../config.json';

import {
  store,
  getFieldValueLabel,
} from '../store/store';

import {
  updateChannel, updateOS, updateAggregationLevel,
} from '../store/actions';

const OFFSET = 10;
const COMPACT = true;
</script>

<style>
.main-filters {
  display:grid;
  grid-auto-flow: column;
  grid-column-gap:var(--space-base);
  align-items: center;
  margin-left: var(--space-4x);
}

.main-filter__label {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  grid-column-gap: var(--space-1h);
}

.pull-right-edge {
  margin-right: calc(var(--space-1h) * -1);
  display:grid;
  align-items: center;
}

</style>

<div class='main-filters'>
  <MenuButton compact={COMPACT} offset={OFFSET} position='top-right'>
    <div class=main-filter__label slot="label">{getFieldValueLabel('channel', $store.channel)} <div class=pull-right-edge><DownCarat size=14 /></div></div>
    <div slot="menu">
      <MenuList on:selection={(event) => { store.dispatch(updateChannel(event.detail.key)); }}>
          {#each CONFIG.fields.channel.values as {key, label}, i (key)}
          <!-- <RadioSelector value={key} label={label} group={$store.channel} /> -->
            <MenuListItem  key={key} value={key}><span class='story-label
              first'></span>{label}</MenuListItem>
            {/each}
        </MenuList>
    </div>
    </MenuButton>
    <MenuButton compact={COMPACT} offset={OFFSET}  position='top-right'>
        <div class=main-filter__label slot="label">{getFieldValueLabel('os', $store.os)}<div class=pull-right-edge><DownCarat size=14 /></div></div>
        <div slot="menu">
            <MenuList on:selection={(event) => { store.dispatch(updateOS(event.detail.key)); }}>
              {#each CONFIG.fields.os.values as {key, label}, i (key)}
                <MenuListItem  key={key} value={key}><span class='story-label
                  first'></span>{label}</MenuListItem>
                {/each}
            </MenuList>
        </div>
      </MenuButton>
      <MenuButton compact={COMPACT}  offset={OFFSET}  position='top-right'>
          <div class=main-filter__label slot="label">{getFieldValueLabel('aggregationLevel', $store.aggregationLevel)}<div class=pull-right-edge><DownCarat size=14 /></div></div>
          <div slot="menu">
              <MenuList on:selection={(event) => { store.dispatch(updateAggregationLevel(event.detail.key)); }}>
                  {#each CONFIG.fields.aggregationLevel.values as {key, label}, i (key)}
                  <MenuListItem  key={key} value={key}><span class='story-label
                    first'></span>{label}</MenuListItem>
                  {/each}
              </MenuList>
          </div>
        </MenuButton>
</div>