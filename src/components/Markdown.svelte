<script>
  import { marked } from 'marked';

  const renderer = {
    html(html) {
      return `<code>${html.replace('<', '&lt;')}</code>`;
    },
  };
  marked.use({ renderer });

  // if inline is set, do not wrap the markdown in a paragraph -- useful for short snippets
  export let inline = true;
  export let text;
</script>

{#if inline}
  {@html marked.parseInline(text)}
{:else}
  {@html marked.parse(text)}
{/if}
