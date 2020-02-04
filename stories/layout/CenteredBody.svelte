<script>
import App from '../../src/components/layout/App.svelte';
import Toolbar from '../../src/components/layout/Toolbar.svelte';
import ContentHeader from '../../src/components/layout/ContentHeader.svelte';
import ContentBody from '../../src/components/layout/ContentBody.svelte';
import ContentFooter from '../../src/components/layout/ContentFooter.svelte';
</script>

<App centered>
  <Toolbar>
    <h1>
      Untitled Data App
    </h1>
  </Toolbar>
  <ContentHeader>
    <div class="content-block">
      Header elements go here
    </div>
  </ContentHeader>
  <ContentBody>
    <div class="surface surface--depth--large surface--border-radius--1" style="height: 100%;">
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