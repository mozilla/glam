<script>
  import { onMount, getContext } from "svelte";

  const currentCandidate = getContext("currentCandidate");
  const onSelect = getContext("onSelect");
  const allItems = getContext("allItems");

  export let value;
  export let key;
  export let compact = false;
  export let dark = false;

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

  /* li:hover,  li.candidate {
  background-color: var(--cool-gray-200);
  outline: none;
} */

  button {
    border-radius: 0px;
    background-color: transparent;
    margin: 0;
    padding: 0;
    outline: none;
    border: none;
    width: 100%;
    height: 100%;
    padding: var(--space-2x);
    padding-left: var(--space-2x);
    padding-right: var(--space-4x);
    text-align: left;
  }

  button:hover,
  button.candidate {
    background-color: var(--cool-gray-200);
    outline: none;
  }

  button.dark:hover,
  button.dark.candidate {
    background-color: var(--blue-slate-500);
  }

  button.compact {
    padding: var(--space-base);
    padding-right: var(--space-2x);
    font-size: var(--text-015);
  }

  button.dark {
    background-color: var(--blue-slate-800);
    color: white;
  }

  button:focus,
  button:focus * {
    outline: none;
    border: none;
    outline-width: 0;
  }
</style>

<li
  role="menuitem"
  on:mouseover={() => {
    $currentCandidate = itemNumber;
  }}
  on:click={() => {
    onSelect({ key, value, itemNumber });
  }}>
  <button
    class:candidate={itemNumber === $currentCandidate}
    class:dark
    class:compact
    bind:this={bt}
    on:focus={() => {
      $currentCandidate = itemNumber;
    }}>
    <slot name="leading-icon" />
    <slot />
  </button>
</li>
