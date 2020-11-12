<script>
  import { fade } from 'svelte/transition';
  import Modal from './Modal.svelte';
  import Database from './icons/Database.svelte';

  let textarea;
  let status;
  export let getSql;

  // Sets the height of the provided textarea to match its content, plus some
  // extra for horiz scrollbar and padding.
  function setHeight(elem) {
    const el = elem; // Get a reference to the DOM to avoid `no-param-reassign`;
    const newHeight = el.scrollHeight + 20;
    el.style.height = `${newHeight}px`;
  }

  // Copy the textarea text to clipboard.
  function copyTextarea() {
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.selectionStart = -1;
    textarea.selectionEnd = -1;
    if (ok) {
      status = 'Copied!';
      setTimeout(() => {
        status = '';
      }, 2000);
    }
  }
</script>

<style>
  .docs-button {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: transparent;
    display: grid;
    width: 100%;
    color: var(--digital-blue-500);
    border: none;
    cursor: pointer;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    text-decoration: none;
    justify-content: center;
    grid-column-gap: var(--space-base);
    text-transform: uppercase;
    font-size: var(--text-015);
    font-weight: 500;
    padding: var(--space-base);
    transition: background-color 100ms;
    border-radius: var(--space-1h);
  }

  .docs-button:hover {
    background-color: var(--cool-gray-150);
  }

  textarea {
    font-family: monospace;
    width: 100%;
    padding: var(--space-base);
    background-color: var(--cool-gray-100);
  }
</style>

<Modal>
  <div slot="trigger" let:open>
    <button on:click={open} class="docs-button">
      <Database size={16} />
      View SQL Query
    </button>
  </div>
  <div slot="title">SQL Query</div>
  <div>
    <p>
      The following SQL query can be copy/pasted and used in the BigQuery
      console to explore this data further:
    </p>
    <textarea
      bind:this={textarea}
      spellcheck="false"
      use:setHeight
      readonly
      wrap="off">{getSql()}</textarea>
    <button on:click={copyTextarea}>Copy to clipboard</button>
    {#if status}
      <span contenteditable="true" bind:textContent={status} transition:fade />
    {/if}
  </div>
</Modal>
