<script context="module">
  export async function load({ fetch }) {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    return { props: { articles } };
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

<div class="max-w-screen-md mx-auto my-4 sm:my-8 px-4 sm:px-8">
  {#each filteredArticles as article, i}
    {#if i}
      <hr class="border-carbonblue-50 mx-auto w-1/2 opacity-25 my-6 sm:my-12" />
    {/if}
    <ArticleCard article="{article}" />
  {/each}
</div>
