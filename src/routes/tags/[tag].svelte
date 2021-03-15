<style>
</style>

<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/tags/${params.tag}.json`);
    const data = await response.json();
    if (response.status !== 200) {
      this.error(response.status, data.message);
      return;
    }
    return { tag: data };
  }
</script>

<script>
  import ArticleCard from '../../components/ArticleCard.svelte';
  import TagCard from '../../components/TagCard.svelte';
  import { makeTitle } from '../_utils';

  export let tag;
</script>

<svelte:head>
  <title>{makeTitle(`标签：${tag.name}`)}</title>
  {#if tag.description}
    <meta name="description" content="{tag.description}" />
  {/if}
</svelte:head>

<div class="max-w-screen-md mx-auto px-8">
  <TagCard tag="{tag}" showArticlesCount="{false}" extraClasses="my-8" />
  {#each tag.articles as article, i}
    {#if i}
      <hr class="border-indigo-50 mx-auto w-1/2 opacity-25" />
    {/if}
    <ArticleCard article="{article}" />
  {/each}
</div>
