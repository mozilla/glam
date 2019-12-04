<script>
const depths = ['tiny', 'small', 'medium', 'large', 'jumbo', '5l'];
</script>

<style>
.depths {
  display: flex;
  flex-wrap: row;
}

.depth {
  width: var(--space-24x);
  height: var(--space-16x);
  border-radius: var(--space-base);
  display: grid;
  align-content: center;
  justify-content: center;
  margin: var(--space-2x);

}

.depth--tiny {
  box-shadow: var(--depth-tiny);
}

.depth--small {
  box-shadow: var(--depth-small);
}

.depth--medium {
  box-shadow: var(--depth-medium);
}

.depth--large {
  box-shadow: var(--depth-large);
}

.depth--jumbo {
  box-shadow: var(--depth-jumbo);
}

.depth--5l {
  box-shadow: var(--depth-5l);
}

</style>

<div class=story>
  <h1 class=story__title>Depth</h1>
  <div class=depths>
    {#each depths as depth, i}
      <div class="depth depth--{depth}">{depth}</div>
    {/each}
  </div>
</div>