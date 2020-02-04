<script>
import App from '../../src/components/layout/App.svelte';
import Toolbar from '../../src/components/layout/Toolbar.svelte';
import Content from '../../src/components/layout/Content.svelte';
import ContentHeader from '../../src/components/layout/ContentHeader.svelte';
import ContentBody from '../../src/components/layout/ContentBody.svelte';
import ContentFooter from '../../src/components/layout/ContentFooter.svelte';

import Button from '../../src/components/Button.svelte';
import ButtonGroup from '../../src/components/ButtonGroup.svelte';
import Chart from '../../src/components/icons/Chart.svelte';
import Table from '../../src/components/icons/Table.svelte';
import Help from '../../src/components/icons/Help.svelte';
import Search from '../../src/components/icons/Search.svelte';
import UsageMetricsContent from '../data-graphics/mozilla/UsageMetricsContent.svelte';
</script>

<App centered>
  <Toolbar>
    <h1>
      Untitled Data App
    </h1>
  </Toolbar>
  <Content centered>
    <ContentHeader>
      <div class="content-block">
        <ButtonGroup>
          <Button level=medium compact><Chart size=14 /> buttons</Button>
          <Button level=medium compact><Table size=14 /> could</Button>
          <Button level=medium compact><Help size=14 /> go</Button>
          <Button level=medium compact><Search size=14 /> here</Button>
        </ButtonGroup>
      </div>
    </ContentHeader>
    <ContentBody>
      <div class="surface surface--depth--large surface--border-radius--1" style="height: 100%;">
        <div class=content-block style='display: grid; align-items: center; width: max-content; margin: auto;'>
          <h2 style="margin:0; margin-top: var(--space-base);">Some Compelling Graphs <Chart /></h2>
          <UsageMetricsContent />
        </div>
        
      </div>
    </ContentBody>
    <ContentFooter>
      <div class="content-block">
        UNTITLED DATA PROJECT INDUSTRIES, 2020.
      </div>
    </ContentFooter>
  </Content>
</App>