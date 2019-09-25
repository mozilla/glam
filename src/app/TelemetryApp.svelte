<script>
import { onMount } from 'svelte';
import Search from './sections/Search.svelte';
// import Details from '../components/Details.svelte';
import GraphicBody from './sections/GraphicBody.svelte';

import App from '../components/sections/App.svelte';
import Main from '../components/sections/Main.svelte';
import MainActionBar from '../components/sections/MainActionBar.svelte';
import Content from '../components/sections/Content.svelte';

import TelemetryAppBar from './sections/TelemetryAppBar.svelte';
import TelemetryControls from './sections/TelemetryControls.svelte';
import ProbeDetails from './sections/ProbeDetails.svelte';

import { currentQuery } from './store/store';

let visible = false;

function updateQueryString() {
  if (window.history.pushState) {
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${$currentQuery}`;
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

$: if (visible) {
  updateQueryString($currentQuery);
}

onMount(() => { visible = true; });

</script>

<style>


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
