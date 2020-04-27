<script>
  import Button from 'udgl/Button.svelte';
  import ButtonGroup from 'udgl/ButtonGroup.svelte';
  import GlamErrorShapes from './GlamErrorShapes.svelte';

  import productConfig from '../../config/products';

  import {
    store,
  } from '../../state/store';

  const OSes = Object.values(productConfig[$store.product].dimensions.os.values);
  const channels = Object.values(productConfig[$store.product].dimensions.channel.values);
  const processes = Object.values(productConfig[$store.product].dimensions.process.values);
  const aggs = Object.values(productConfig[$store.product].dimensions.aggregationLevel.values);
</script>

<style>

.data-error-msg__bg {
    background: radial-gradient(var(--cool-gray-100), var(--cool-gray-100));
    padding: var(--space-4x);
    border-radius: 50%;
  }
  .dimensions {
    display: grid;
    grid-auto-flow: column;
    grid-gap: var(--space-2x);
    justify-content: start;
  }
  .temporary-data-error-msg {
    color: var(--cool-gray-650);
    line-height: 1.5;
    font-size: var(--text-02);
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: var(--space-3x);
    padding-top: var(--space-4x);
    width: 700px;
    margin: auto;
  }
  h2 {
    font-weight: 600;
    font-size: var(--text-06);
    margin: 0;
    text-align: center;
  }
  p {
    margin: 0;
  }
  .more-info {
    margin-top: calc(-1.125 * var(--space-3x));
    font-weight: 400;
    text-align: center;
    font-style: italic;
  }
</style>

<div class="temporary-data-error-msg">
  <div style="margin: auto;">
    <div class="data-error-msg__bg" style="width: 120px">
      <GlamErrorShapes />
    </div>
  </div>
  <h2>Oh no! GLAM hit a known bug.</h2>
  <p class="more-info">We couldn't find data for the dimensions currently selected.</p>
  <p>For now, try selecting another process below to see data:</p>
  <div>
    <label  class=body-control-set--label>Process</label>
    <ButtonGroup>
      {#each processes as process}
        <Button compact level="medium" toggled={$store.productDimensions.process === process.key}
          on:click={() => store.setDimension('process', process.key)}>{process.label}</Button>
      {/each}
    </ButtonGroup>
  </div>

  <p>If that didn't work, please try selecting one of the other remaining dimensions (like OS): </p>

  <div class="dimensions">
    <div>
      <label class="body-control-set--label">Channel</label>
      <ButtonGroup>
        {#each channels as channel}
          <Button compact level="medium" toggled={$store.productDimensions.channel === channel.key}
            on:click={() => store.setDimension('channel', channel.key)}>{channel.label}</Button>
        {/each}
      </ButtonGroup>
    </div>
    <div>
      <label class="body-control-set--label">OS</label>
      <ButtonGroup>
        {#each OSes as os}
          <Button compact level="medium" toggled={$store.productDimensions.os === os.key}
            on:click={() => store.setDimension('os', os.key)}>{os.label}</Button>
        {/each}
      </ButtonGroup>
    </div>
    <div>
      <label class="body-control-set--label">Aggregation Level</label>
      <ButtonGroup>
        {#each aggs as aggregationLevel}
          <Button compact level="medium" toggled={$store.productDimensions.aggregationLevel === aggregationLevel.key}
            on:click={() => store.setDimension('aggregationLevel', aggregationLevel.key)}>{aggregationLevel.label}</Button>
        {/each}
      </ButtonGroup>
    </div>
  </div>

  <p>If you still get this error, try reporting this in the
    <a target="_blank" href="https://mozilla.slack.com/archives/CB1EQ437S">#GLAM</a> Slack channel.</p>
</div>
