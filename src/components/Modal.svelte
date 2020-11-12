<script>
  import { fade } from 'svelte/transition';
  import { Close } from '@graph-paper/icons';

  let isOpen = false;

  const open = () => {
    isOpen = true;
  };
  const close = () => {
    isOpen = false;
  };

  const keydown = (e) => {
    if (e.key === 'Escape') {
      close();
    }
  };
</script>

<style>
  .gp-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .gp-modal__backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .gp-modal__wrapper {
    position: relative;
    z-index: 1000;
    border-radius: var(--space-1h);
    background-color: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .gp-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: var(--space-base) var(--space-2x);
    background-color: var(--toolbar-background-color);
    color: var(--toolbar-text-color);
  }
  .gp-modal__header h1 {
    font-family: var(--brand-font);
    font-weight: normal;
    padding: var(--space-base) 0 0 0;
    margin: 0;
    font-size: var(--text-06);
    line-height: var(--text-06);
  }
  .gp-modal__header button {
    margin: 0;
    padding: var(--space-base);
    border: 0;
    background-color: var(--toolbar-background-color);
    color: var(--toolbar-text-color);
    cursor: pointer;
  }
  .gp-modal__content {
    padding: var(--space-2x);
    max-height: 50vh;
    overflow: auto;
  }
</style>

<slot name="trigger" {open}><button on:click={open}>open</button></slot>

{#if isOpen}
  <!-- svelte-ignore a11y-autofocus -->
  <div
    class="gp-modal"
    on:keydown|stopPropagation={keydown}
    tabindex={0}
    autofocus
    transition:fade={{ duration: 250 }}>
    <div class="gp-modal__backdrop" on:click={close} />
    <div class="gp-modal__wrapper">
      <div class="gp-modal__header">
        <h1>
          <slot name="title" />
        </h1>
        <button on:click={close}>
          <Close />
        </button>
      </div>
      <div class="gp-modal__content">
        <slot />
      </div>
    </div>
  </div>
{/if}
