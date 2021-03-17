<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/articles/articles.json`);
    const data = await response.json();
    return { articles: data };
  }
</script>

<script>
  import { makeTitle } from '../_utils';
  import ArticleCard from '../../components/ArticleCard.svelte';

  export let articles;

  $: filteredArticles = articles.filter((p) => !p.isPageArticle);
</script>

<svelte:head>
  <title>{makeTitle('文章')}</title>
</svelte:head>

<div class="max-w-screen-md mx-auto mt-4 sm:mt-8 px-4 sm:px-8">
  {#each filteredArticles as article, i}
    {#if i}
      <hr class="border-indigo-50 mx-auto w-1/2 opacity-25" />
    {/if}
    <ArticleCard article="{article}" />
  {/each}
</div>
