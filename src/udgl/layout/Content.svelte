<script>
  export let centered = false;
  export let contentHeader = true;
  export let contentFooter = true;
</script>

<div
  class="content"
  class:content--centered-body={centered}
  class:content--no-header={!contentHeader}
  class:content--no-footer={!contentFooter}>
  <slot />
</div>
