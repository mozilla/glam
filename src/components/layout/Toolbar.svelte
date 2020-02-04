<script>
  export let sticky = false;
</script>

<header class=toolbar class:toolbar--sticky={sticky}>
  <slot></slot>
</header>