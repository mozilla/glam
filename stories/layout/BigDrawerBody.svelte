<script>
import App from '../../src/components/layout/App.svelte';
import Toolbar from '../../src/components/layout/Toolbar.svelte';
import Content from '../../src/components/layout/Content.svelte';
import ContentBody from '../../src/components/layout/ContentBody.svelte';
import ContentHeader from '../../src/components/layout/ContentHeader.svelte';
import ButtonGroup from '../../src/components/ButtonGroup.svelte';
import Button from '../../src/components/Button.svelte';

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