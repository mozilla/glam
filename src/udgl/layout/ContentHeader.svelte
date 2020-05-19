<style>
  .content-header {
    grid-column: body-content;
    grid-row: body-header;
    display: grid;
    align-items: center;
    height: 100%;
    grid-auto-flow: column;
    align-items: center;
    justify-items: start;
  }
</style>

<div class="content-header">
  <slot></slot>
</div>
