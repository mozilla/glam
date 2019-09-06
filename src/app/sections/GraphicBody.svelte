<script>
import { setContext } from 'svelte';
import { searchQuery, store, updateProbe } from '../store/store.js';
import TelemetrySearchResults from './TelemetrySearchResults.svelte';

// updateProbe could easily just be put into TelemetrySearchResults since
// it is a consumer
setContext('updateProbe', store.connect(updateProbe));

</script>

<style>

.graphic-body-container {
    padding: var(--space-2x);
}



.graphic-body__graphic-header {
    display: grid;
    grid-template-columns: auto max-content;
    grid-column-gap: var(--space-4x);
    align-items: start;
}

.graphic-body__graphic-header h2 {
    margin:0;
    padding:0;
    width: 100%;
    word-break: break-all;
}

/* .label {
    border-radius: var(--border-radius-1h);
    font-size:.75em;
    text-transform: uppercase;
    color: white;
    display:grid;
    align-items: center;
    align-self: start;
    background-color: var(--subhead-gray);
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
} */

</style>


<TelemetrySearchResults />

<div class=graphic-body-container>

    <div class=graphic-body__graphic-header>
    {#if $store.probe.name}
        <h2 class='heading--03'>{$store.probe.name}</h2>
        <div class='label label--{$store.probe.probeType} label-text--01'>{$store.probe.probeType}</div>
    {:else}
        <h2 class='heading--04'>Telemetry Prototype</h2>
    {/if}
    </div>
<!-- <p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio euismod lacinia at quis risus sed. Blandit libero volutpat sed cras ornare arcu dui vivamus arcu. Pharetra convallis posuere morbi leo. Penatibus et magnis dis parturient montes nascetur ridiculus. Ut morbi tincidunt augue interdum velit. Sapien nec sagittis aliquam malesuada bibendum arcu. Ornare lectus sit amet est placerat in. Faucibus vitae aliquet nec ullamcorper sit amet risus nullam eget. Eget gravida cum sociis natoque penatibus. Nunc lobortis mattis aliquam faucibus purus in massa tempor nec. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit. Non quam lacus suspendisse faucibus interdum posuere lorem. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique.
</p>
<p>
Nunc sed blandit libero volutpat sed cras ornare arcu dui. Nulla aliquet porttitor lacus luctus accumsan tortor posuere. Purus sit amet volutpat consequat mauris nunc congue. Nulla aliquet porttitor lacus luctus. Eu scelerisque felis imperdiet proin fermentum leo vel orci. Risus nec feugiat in fermentum. Massa enim nec dui nunc mattis enim ut tellus. Suspendisse in est ante in nibh mauris cursus. Elementum sagittis vitae et leo duis ut diam quam. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Non odio euismod lacinia at quis risus. Pellentesque dignissim enim sit amet venenatis. Amet purus gravida quis blandit. Eu feugiat pretium nibh ipsum consequat nisl vel. Suspendisse in est ante in nibh mauris cursus mattis. Urna cursus eget nunc scelerisque viverra. Varius quam quisque id diam vel quam elementum pulvinar etiam. Consectetur libero id faucibus nisl tincidunt. Viverra justo nec ultrices dui sapien eget mi proin.
</p>
<p>
Non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor. Vitae turpis massa sed elementum tempus egestas sed. Ultrices dui sapien eget mi proin sed libero enim sed. Luctus accumsan tortor posuere ac ut consequat semper. Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Purus semper eget duis at. Nisi lacus sed viverra tellus in hac habitasse. Amet nisl purus in mollis nunc. Euismod lacinia at quis risus sed vulputate. Urna condimentum mattis pellentesque id nibh tortor id aliquet. Egestas erat imperdiet sed euismod nisi porta lorem mollis.
</p> -->
<!-- <p>
At tellus at urna condimentum mattis pellentesque id. Nunc mi ipsum faucibus vitae. Risus nullam eget felis eget. At varius vel pharetra vel turpis nunc eget. Nam libero justo laoreet sit amet cursus sit amet. Ullamcorper malesuada proin libero nunc consequat. Ac feugiat sed lectus vestibulum mattis. Mi ipsum faucibus vitae aliquet nec. Lacus viverra vitae congue eu consequat ac. In pellentesque massa placerat duis ultricies.
</p>
<p>
Ac tincidunt vitae semper quis lectus nulla at volutpat diam. Amet nulla
facilisi morbi tempus. Placerat duis ultricies lacus sed. Sed viverra ipsum nunc
aliquet bibendum enim facilisis. Hac habitasse platea dictumst quisque sagittis
purus. Semper quis lectus nulla at volutpat diam ut. Sit amet facilisis magna
etiam tempor orci eu lobortis. Pretium viverra suspendisse potenti nullam ac.
Viverra orci sagittis eu volutpat. Massa enim nec dui nunc mattis enim ut. Vel
facilisis volutpat est velit egestas. Adipiscing at in tellus integer feugiat
scelerisque varius morbi enim. Lobortis mattis aliquam faucibus purus. Amet
consectetur adipiscing elit pellentesque habitant. Purus faucibus ornare
suspendisse sed nisi. Est lorem ipsum dolor sit amet consectetur. Sed egestas
egestas fringilla phasellus faucibus. Ultricies tristique nulla aliquet enim
tortor at auctor.
</p>  -->

</div>