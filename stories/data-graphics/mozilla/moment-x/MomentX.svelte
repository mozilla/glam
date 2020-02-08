<script>


import App from 'udgl/layout/App.svelte';
import Content from 'udgl/layout/Content.svelte';
import ContentHeader from 'udgl/layout/ContentHeader.svelte';
import ContentBody from 'udgl/layout/ContentBody.svelte';
import ContentFooter from 'udgl/layout/ContentFooter.svelte';

import Button from 'udgl/Button.svelte';
import Doc from 'udgl/icons/Doc.svelte';
import MozillaLogo from 'udgl/icons/MozillaLogo.svelte';

import Header from './components/Header.svelte';

import Executive from './routes/executive.svelte';
import Product from './routes/product.svelte';
import Marketing from './routes/marketing.svelte';

let segment = 'EXECUTIVE';

</script>

<App>
  <Header bind:segment />
  <Content centered>
    <ContentHeader>
      <div style='width: max-content; padding-left: var(--space-2x);'>
        <Button compact level=medium> <Doc size=14 /> Documentation</Button>
      </div>
    </ContentHeader>
    <ContentBody>
      <div 
        class="surface surface--border-radius--1 surface--depth--small" style="height: 100%;">
        <div class='content-block--padding--8 content-block' style='padding: var(--space-4x);'>
          {#if segment === 'EXECUTIVE'}
            <Executive />
          {:else if segment === 'PRODUCT'}
            <Product />
          {:else if segment === 'MARKETING'}
            <Marketing />
          {/if}
        </div>
      </div>
    </ContentBody>
    <ContentFooter>
      <div style="padding-left: var(--space-2x); height: 100%; display: grid; align-items: center; height: calc(var(--incrememt)*4);">
        <MozillaLogo />
      </div>
    </ContentFooter>
  </Content>
</App>