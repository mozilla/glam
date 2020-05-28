<script>
  import { getContext } from 'svelte';
  import RadioChecked from './icons/RadioChecked.svelte';
  import RadioUnchecked from './icons/RadioUnchecked.svelte';

  export let value;
  export let label;
  export let group;
  export let isSelected = value === group;

  $: isSelected = value === group;

  const parentCallback = getContext('onSelect');

  export let onSelect = () => {
    parentCallback(value);
  };
</script>

<style>
  .radio {
    margin-left: var(--space-base);
    margin-right: var(--space-base);
    font-size: var(--body-font-small-size);
    position: relative;
    display: grid;
    grid-template-columns: var(--space-4x) auto;
    height: calc(var(--space-4x));
    align-items: center;
    margin-bottom: -1px;
    padding-left: var(--space-1h);
    padding-right: var(--space-base);
    color: white;
    border-radius: var(--border-radius-1h);
  }

  .radio:hover {
    background-color: var(--blue-slate-700);
  }

  .radio--selected {
    text-align: center;
    display: grid;
    align-items: center;
    justify-items: center;
  }

  .radio__icon {
    position: relative;
  }

  .radio__input {
    opacity: 0;
    width: var(--increment);
    padding: 0px;
    cursor: inherit;
    position: absolute;
    display: grid;
    align-items: center;
    padding-left: calc(var(--increment) * -1);
  }
</style>

<label class="radio">

  <div class="radio__icon" aria-disabled="false">
    <input
      class="radio__input"
      type="radio"
      {value}
      bind:group
      on:click={onSelect}
      checked={isSelected} />
    <div class="radio--selected" aria-hidden="true">
      {#if isSelected}
        <RadioChecked />
      {:else}
        <RadioUnchecked />
      {/if}
    </div>
  </div>
  <div class="radio--label">{label}</div>
</label>
