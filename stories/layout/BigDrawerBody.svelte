<script>
import App from 'udgl/layout/App.svelte';
import Toolbar from 'udgl/layout/Toolbar.svelte';
import Content from 'udgl/layout/Content.svelte';
import ContentBody from 'udgl/layout/ContentBody.svelte';
import ContentHeader from 'udgl/layout/ContentHeader.svelte';
import ButtonGroup from 'udgl/ButtonGroup.svelte';
import Button from '@graph-paper/button';

import UsageMetricsContent from '../data-graphics/mozilla/UsageMetricsContent.svelte';
</script>

<App orientation=horizontal>
  <Toolbar transparent>
    <h1>
      Untitled Product Metrics App
    </h1>

    <div class=content-block style="display: grid; grid-auto-flow: row; grid-row-gap: var(--space-2x); align-items: end; justify-content: end; justify-items: end;">
      <ButtonGroup>
        <Button level=medium compact dark>Nightly</Button>
        <Button level=medium compact dark>Beta</Button>
        <Button level=medium compact dark>Release</Button>
      </ButtonGroup>
      <Button level=medium compact dark>First Click</Button>
      <Button level=medium compact dark>Second Click</Button>
      <Button level=medium compact dark>Third Option</Button>
    </div>
  </Toolbar>

  <div style='background-color: white;'>
    <Content>
      <ContentHeader>
        <div class=content-block>
          <h2 style='margin:0;'>Explore / product metrics</h2>
        </div>
      </ContentHeader>
      <ContentBody>
        <div class="surface" style="height: 100%;">
          <div class=content-block>
            <UsageMetricsContent />
          </div>
        </div>
      </ContentBody>
    </Content>
  </div>
</App>
