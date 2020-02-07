<script>
import Help from 'udgl/icons/Help.svelte';
import { tooltip } from 'udgl/utils/tooltip';
import { formats } from '../utils/formatters';

export let value;
export let sublabel = '';
export let label = '';
export let description;
export let format = 'count';

export let duration = 750;
</script>

<style>
.big-number {
  font-size: var(--text-04);
  width: max-content;
  text-align: right;
}

.big-number--sublabel {
  font-size: var(--text-02);
  text-transform: uppercase;
  color: var(--cool-gray-550);
}
.big-number--label {
  font-weight: 600;
}
.big-number--number {
  text-align: right;
  font-size: var(--text-08);
  font-weight: 300;
}

</style>

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
    <span use:tooltip={description}>
      <Help size=16 />
    </span>
    {/if}
  </div>
  <div class=big-number--number>
    <slot name=big-number>{value}</slot>
  </div>
  <div class=big-number--compare></div>
</div>