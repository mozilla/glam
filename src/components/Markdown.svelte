<script>
  import { use, parse, parseInline } from 'marked';

  const renderer = {
    html(html) {
      return `<code>${html.replace('<', '&lt;')}</code>`;
    },
  };
  use({ renderer });

  // if inline is set, do not wrap the markdown in a paragraph -- useful for short snippets
  export let inline = true;
  export let text;
</script>

{#if inline}
  {@html parseInline(text)}
{:else}
  {@html parse(text)}
{/if}
