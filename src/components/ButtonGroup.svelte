

<style>
div {
  display:grid;
  grid-auto-flow: column;
  width: max-content;
}

div :global(button:not(:first-child):not(:last-child)) {
  border-radius: 0px;
}

div :global(button:first-child) {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}

div :global(button:last-child) {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}

</style>

<div>
  <slot></slot>
</div>