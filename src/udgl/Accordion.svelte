<script>
  import { slide } from 'svelte/transition';
  import CaratIcon from './icons/Carat.svelte';

  let revealed = false;

  export const expand = (v = false) => {
    revealed = v;
  };
</script>

<style>
  section {
    box-sizing: border-box;
    cursor: pointer;
  }

  .accordion-summary {
    background-color: transparent;
    border: none;
    color: white;
    width: 100%;
    text-align: left;
    padding: 0;
    margin: 0;
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    font-weight: 300;
    display: grid;
    grid-template-columns: auto var(--space-4x);
    grid-template-rows: max-content max-content;
    grid-template-areas:
      'title carat'
      'description _';
    padding-bottom: var(--space-2x);
    padding-top: var(--space-2x);
    transition: background-color 100ms;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .accordion-summary:hover {
    background-color: var(--blue-slate-700);
  }

  .title {
    grid-area: title;
    display: grid;
    align-items: center;
  }
  .carat {
    grid-area: carat;
    justify-self: end;
  }

  .carat div {
    transition: transform 200ms;
    display: grid;
    align-self: center;
  }

  .description {
    grid-area: description;
    padding-top: calc(var(--space-base) / 2);
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.5);
  }

  .expanded-content {
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: var(--space-base);
    padding-bottom: var(--space-base);
  }

  .revealed {
    background-color: var(--blue-slate-900);
  }
</style>

<section class:revealed>
  <button
    on:click={() => {
      expand(!revealed);
    }}
    class="accordion-summary">
    <div class="title heading--01">
      <slot name="title">Channel</slot>
    </div>
    <div class="carat">
      <div style="transform: rotate({revealed ? 90 : 0}deg);">
        <CaratIcon />
      </div>
    </div>
    <div class="description">
      <slot name="description" />
    </div>
  </button>

  {#if revealed}
    <div transition:slide={{ duration: 100 }} class="expanded-content">
      <slot name="content" />
    </div>
  {/if}

</section>
