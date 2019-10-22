<script>
import Button from '../src/components/Button.svelte';
import ButtonGroup from '../src/components/ButtonGroup.svelte';

let first = 0;

function setFirst(v) { first = v; }

let second = [];
function setSecond(v) {
  if (second.includes(v)) second = [...second.filter((vi) => vi !== v)];
  else {
    second = [...second, v];
  }
}

</script>

<style>
div.section {
  margin-bottom: var(--space-base);
}
</style>

<div class=story>

  <div class=section>
    <ButtonGroup>
      <Button toggled={first === 0} on:click={() => { setFirst(0); }}>First</Button>
      <Button toggled={first === 1} on:click={() => { setFirst(1); }}>Second</Button>
      <Button toggled={first === 2} on:click={() => { setFirst(2); }}>Third</Button>
    </ButtonGroup>
  </div>

  <div class=section>
    <h2>Each One Toggle-able</h2>
    <ButtonGroup>
      <Button toggled={second.includes(0)} on:click={() => { setSecond(0); }} compact>First</Button>
      <Button toggled={second.includes(1)} on:click={() => { setSecond(1); }} compact>Second</Button>
      <Button toggled={second.includes(2)} on:click={() => { setSecond(2); }} compact>Third</Button>
    </ButtonGroup>
  </div>
  <div class=section>
      <ButtonGroup>
        <Button toggled={second.includes(1)} on:click={() => { setSecond(1); }}  compact level=medium>Second</Button>
        <Button toggled={second.includes(2)} on:click={() => { setSecond(2); }}  compact level=medium>Third</Button>
        <Button toggled={second.includes(0)} on:click={() => { setSecond(0); }}  compact level=medium>First</Button>
      </ButtonGroup>
    </div>
    <div class=section>
        <ButtonGroup>
          <Button toggled={second.includes(2)} on:click={() => { setSecond(2); }} compact level=low>Third</Button>
          <Button toggled={second.includes(0)} on:click={() => { setSecond(0); }} compact level=low>First</Button>
          <Button toggled={second.includes(1)} on:click={() => { setSecond(1); }} compact level=low>Second</Button>
        </ButtonGroup>
      </div>
</div>