<script>
export let centered = false;
export let contentHeader = true;
export let contentFooter = true;
</script>

<div class=app-layout 
  class:app-layout--centered-body={centered}
  class:app-layout--no-content-header={!contentHeader}  
  class:app-layout--no-content-footer={!contentFooter}  
>
  <slot></slot>
</div>