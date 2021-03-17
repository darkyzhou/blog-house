<script context="module">
  export async function preload({ params, query }) {
    const articleSlug = params.page;
    const response = await this.fetch('/articles/articles.json');
    const articles = await response.json();
    const targetArticle = articles.find((a) => a.slug === articleSlug);
    return { article: targetArticle };
  }
</script>

<script>
  import Article from './articles/[article].svelte';

  export let article;
</script>

<Article article="{article}" />
