<script>
import Help from 'udgl/icons/Help.svelte';
import { tooltip } from 'udgl/utils/tooltip';

export let value;
export let sublabel = '';
export let label = '';
export let description;
export let format = 'count';

export let duration = 750;
</script>

<div class=big-number>
  <div class=big-number--sublabel>
    <slot name=sublabel>
      {sublabel}
    </slot>
  </div>
  <div class=big-number--label>
    <slot name=label>
      {label}
    </slot>
    {#if description}
    <span use:tooltip={{ text: description, location: 'top' }}>
      <Help size=16 />
    </span>
    {/if}
  </div>
  <div class=big-number--number>
    <slot name=big-number>{value}</slot>
  </div>
  <div class=big-number--compare>
    <slot name=small-number></slot>
  </div>
</div>