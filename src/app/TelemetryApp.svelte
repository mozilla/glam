<script>
import Search from './sections/Search.svelte';
//import Details from '../components/Details.svelte';
import GraphicBody from './sections/GraphicBody.svelte';

import App from '../components/sections/App.svelte';
import Main from '../components/sections/Main.svelte';
import MainActionBar from '../components/sections/MainActionBar.svelte'
import Content from '../components/sections/Content.svelte';

import TelemetryAppBar from './sections/TelemetryAppBar.svelte';
import TelemetryControls from './sections/TelemetryControls.svelte';
import ProbeDetails from './sections/ProbeDetails.svelte'
</script>

<style>

:global(:root) {
    
}

div.inner-body {
    display: grid;
    grid-template-columns: [inner-body] auto [right-drawer] max-content;
}

</style>

<App>
    <TelemetryAppBar />
    <Main>
        <TelemetryControls />
        <Content>
            <MainActionBar>
                <Search />
            </MainActionBar>
            <div class=inner-body>
                <GraphicBody />
                <ProbeDetails />
            </div>
            
        </Content>
        <!-- <div class=details>
            <Details />
        </div> -->
    </Main>
</App>