<script>
import ProportionExplorerView from '../../../src/app/patterns/body/proportions/ProportionExplorerView.svelte';
import SSL_RESUMED_SESSION from '../../../tests/data/ssl_resumed_session_build_id.json';
import SSL_HANDSHAKE_VERSION from '../../../tests/data/ssl_handshake_version_build_id.json';

const sslResumedSession = SSL_RESUMED_SESSION.response;
const sslHandshakeVersion = SSL_HANDSHAKE_VERSION.response;

let probes = [
  { name: 'SSL_RESUMED_SESSION', data: sslResumedSession, probeType: 'histogram-boolean' },
  { name: 'SSL_HANDSHAKE_VERSION', data: sslHandshakeVersion, probeType: 'histogram-enumerated' },
];

let which = 0;

</script>


<style>

.story {
  position: relative;
}

.explorer-view {
  margin: auto;
}

.view-header {
  display: grid;
  grid-template-columns: auto max-content;
  font-family: var(--main-mono-font);
  border-bottom: 3px solid var(--cool-gray-200);
  margin-bottom: var(--space-4x);
}

.view-header h1 {
  font-weight: normal;
  margin:0px;
}

.selectors {
  position: relative;
  width: max-content;
  font-size: var(--text-02);
  font-family: var(--main-mono-font);
  margin-bottom: var(--space-4x);
  padding: var(--space-4x);
  border-radius: var(--space-base);
  box-shadow: var(--depth-tiny);
  z-index:1000;
  background-color: white;
  color: var(--blue-slate-600);
}

.selectors i {
  font-weight: 100;
  color: var(--cool-gray-500);
}

</style>


<div class=story>
  <div style="width: 900px;" class='explorer-view'>
      <div class='view-header'>
          <h1>Proportion Explorer</h1>
          <div class='selectors'>
            {#each probes as {name, data}, i}
              <label>
                <input type=radio bind:group={which} value={i}>
                {name} <i>({data.length})</i>
              </label>
            {/each}
            </div>
      </div>
  
    <h1 class="story__title">probe / <span class=probe-head>{probes[which].name}</span></h1>
    {#each probes as probe, i (probe.name)}
      {#if which === i}
        <ProportionExplorerView
          probeType={probe.probeType}
          data={probe.data}
        />
      {/if}
    {/each}
  </div> 
</div>