<script>
  export let centered = false;
  export let contentHeader = true;
  export let contentFooter = true;
</script>

<style>
.content {
  align-self: stretch;
  --header-size: minmax(var(--increment), max-content);
  --footer-size: minmax(var(--increment), max-content);
  --body-width: var(--main-content-width);
  display: grid;
  align-items: start;
  height: 100%;
  grid-template-columns:
    [left] minmax(0px, max-content)
    [body-content] auto
    [right] minmax(0px, max-content);
  grid-template-rows:
    [body-header] var(--header-size)
    [body-content] auto
    [body-footer] var(--footer-size);
}

.content--no-header {
  --header-size: 0;
}
.content--no-footer {
  --header-size: 0;
}

.content--centered-body {
  grid-template-columns:
    [left] auto
    [left-gutter] minmax(0px, 80px)
    [body-content] var(--body-width)
    [right-gutter] minmax(0px, 80px)
    [right] auto;
}
</style>

<div
  class="content"
  class:content--centered-body={centered}
  class:content--no-header={!contentHeader}
  class:content--no-footer={!contentFooter}
>
  <slot></slot>
</div>
