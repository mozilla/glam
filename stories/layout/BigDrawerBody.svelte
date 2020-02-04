<script>
import App from '../../src/components/layout/App.svelte';
import Toolbar from '../../src/components/layout/Toolbar.svelte';
import ContentHeader from '../../src/components/layout/ContentHeader.svelte';
import ContentBody from '../../src/components/layout/ContentBody.svelte';
import ContentFooter from '../../src/components/layout/ContentFooter.svelte';
</script>

<App contentFooter={false} contentHeader={false}>
  <Toolbar transparent>
    <h1>
      Untitled Product Metrics App
    </h1>
  </Toolbar>
  <ContentHeader>
    <div class="content-block">
      Header elements go here
    </div>
  </ContentHeader>
  <ContentBody>
    <div class="surface" style="height: 100%;">
      <div class=content-block>
        Here is the body element.
      </div>
      
    </div>
  </ContentBody>
  <ContentFooter>
    <div class="content-block">
      UNTITLED DATA PROJECT INDUSTRIES, 2020.
    </div>
  </ContentFooter>
</App>