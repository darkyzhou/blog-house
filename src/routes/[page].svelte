<script context="module">
  export async function load({ page, fetch }) {
    const articleSlug = page.params.page;
    const response = await fetch(`/data/articles/${articleSlug}.json`);
    const article = await response.json();
    return { props: { article } };
  }
</script>

<script>
  import Article from './articles/[article].svelte';

  export let article;
</script>

<Article article="{article}" />
