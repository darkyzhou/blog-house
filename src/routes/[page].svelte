<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/articles/${params.page}.json`);
    const data = await response.json();
    if (response.status !== 200) {
      this.error(response.status, data.message);
      return;
    }
    return { article: data };
  }
</script>

<script>
  import Article from './articles/[article].svelte';

  export let article;
</script>

<Article article="{article}" />
