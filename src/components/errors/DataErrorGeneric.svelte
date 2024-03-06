<script>
  import GlamErrorShapes from './GlamErrorShapes.svelte';
  import { store } from '../../state/store';

  export let reason;
  export let moreInformation;

  const DICTIONARY_LINKS = {
    firefox: `https://probes.telemetry.mozilla.org/?view=detail&probeId=${$store.probe.id}`,
    fenix: `https://dictionary.telemetry.mozilla.org/apps/fenix/metrics/${$store.probeName}`,
    fog: `https://dictionary.telemetry.mozilla.org/apps/firefox_desktop/metrics/${$store.probeName}`,
  };
</script>

<style>
  .data-error-msg {
    /* background-color: var(--cool-gray-050); */
    border-radius: var(--space-1h);

    padding: var(--space-4x);
    display: grid;
    align-items: center;
    justify-items: center;
    align-content: center;
    height: 300px;
    --error-msg-width: 400px;
    --error-msg-color: var(--cool-gray-500);
    margin-top: var(--space-16x);
    margin-bottom: var(--space-2x);
  }

  .data-error-msg__bg {
    background: radial-gradient(var(--cool-gray-100), var(--cool-gray-100));
    /* box-shadow: inset 0px 0px 10px rgba(0,0,0,.1); */
    width: 200px;
    height: 200px;
    padding: var(--space-4x);
    border-radius: 50%;
    margin-top: var(--space-2x);
  }

  .data-error-msg__reason {
    padding-top: var(--space-4x);
    width: var(--error-msg-width);
    font-size: var(--text-05);
    font-weight: bold;
    margin-bottom: var(--space-2x);
    color: var(--error-msg-color);
    text-align: center;
  }

  .data-error-msg__more-information {
    width: var(--error-msg-width);
    color: var(--error-msg-color);
    line-height: 1.5;
    margin-bottom: var(--space-2x);
    font-style: italic;
    color: var(--error-msg-color);
  }

  .data-error-msg__call-to-action {
    width: var(--error-msg-width);
    color: var(--error-msg-color);
    line-height: 1.5;
  }
</style>

<div class="data-error-msg">
  <div class="data-error-msg__bg">
    <GlamErrorShapes />
  </div>
  <div class="data-error-msg__reason">{reason}</div>
  {#if moreInformation}
    <div class="data-error-msg__more-information">{moreInformation}</div>
    <div class="data-error-msg__more-information">
      For more resources, visit the <a href={DICTIONARY_LINKS[$store.product]}
        >dictionary</a
      >.
    </div>
  {/if}
  <div class="data-error-msg__call-to-action">
    If you think this is a bug, report this on the <a
      href="https://mozilla.slack.com/archives/CB1EQ437S">#glam</a
    >
    channel on Mozilla's internal Slack, or
    <a href="https://matrix.to/#/#datatools:mozilla.org">#datatools</a> on
    Mozilla's Matrix or in the
    <a href="https://github.com/mozilla/glam/issues/new"
      >GLAM github repository</a
    >.
  </div>
</div>
