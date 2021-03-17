<script context="module">
  export async function preload({ params, query }) {
    const articleSlug = params.page;
    const response = await this.fetch(`/data/articles/${articleSlug}.json`);
    const article = await response.json();
    return { article };
  }
</script>

<script>
  import Article from './articles/[article].svelte';

  export let article;
</script>

<Article article="{article}" />
