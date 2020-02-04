<script>
export let centered = false;
</script>

<!-- 
content header
content body
content footer 
-->

<div class:content-body--centered={centered}>
  <slot></slot>
</div>