<script>
import { onMount, getContext } from 'svelte';

const currentCandidate = getContext('currentCandidate');
const onSelect = getContext('onSelect');
const allItems = getContext('allItems');

export let value;
export let key;

let itemNumber;
let bt;
onMount(() => {
  $allItems = [...$allItems, { key, value }];
  itemNumber = $allItems.length - 1;
});

</script>

<style>
li {

  font-size: var(--text-02);
  user-select: none;
}

li:hover,  li.candidate {
  background-color: var(--cool-gray-200);
  outline: none;
}

button {
  background-color: transparent;
  margin:0;
  padding:0;
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
  padding: var(--space-2x);
  padding-left: var(--space-2x);
  padding-right: var(--space-4x);
  text-align: left;
}

button:focus, button:focus * {
  outline: none;
  border: none;
  outline-width: 0;
}
</style>

<li role='menuitem' 
  class:candidate={itemNumber
=== $currentCandidate} on:mouseover={() => { $currentCandidate = itemNumber; }}
on:click={() => { onSelect({ key, value, itemNumber }); } }>
  <button bind:this={bt} on:focus={() => { $currentCandidate = itemNumber; }}>
    <slot></slot>
  </button>
</li>