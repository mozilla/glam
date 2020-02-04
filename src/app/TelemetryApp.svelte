<script>
import { onMount } from 'svelte';
import Search from './sections/Search.svelte';
import GraphicBody from './sections/GraphicBody.svelte';

import GLAMFooterContent from './sections/GLAMFooterContent.svelte';

import GLAMMark from './sections/GLAMMark.svelte';
import TelemetryMainFilters from './sections/TelemetryMainFilters.svelte';

import App from '../components/layout/App.svelte';
import Toolbar from '../components/layout/Toolbar.svelte';
import Content from '../components/layout/Content.svelte';
import ContentHeader from '../components/layout/ContentHeader.svelte';
import ContentBody from '../components/layout/ContentBody.svelte';
import ContentFooter from '../components/layout/ContentFooter.svelte';
import ProbeViewControl from './patterns/controls/ProbeViewControl.svelte';

import { currentQuery } from '../state/store';

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

<App>
  <Toolbar sticky>
    <GLAMMark />
    <Search />
    <TelemetryMainFilters />
  </Toolbar>
  <Content centered>
    <ContentHeader>
      <ProbeViewControl />
    </ContentHeader>
    <ContentBody>
      <GraphicBody />
    </ContentBody>
    <ContentFooter>
      <GLAMFooterContent />
    </ContentFooter>
  </Content>
</App>