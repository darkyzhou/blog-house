<script context="module">
  export async function load({ page, fetch }) {
    const tagSlug = page.params.tag;
    const response = await fetch('data/tags.json');
    const tags = await response.json();
    const targetTag = tags.find((t) => t.slug === tagSlug);
    return { props: { targetTag } };
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

<div class="pageContainer max-w-screen-md mx-auto px-8">
  <TagCard tag="{tag}" showArticlesCount="{false}" class="my-8" />
  {#each tag.articles as article, i}
    {#if i}
      <hr class="border-carbonblue-50 mx-auto w-1/2 opacity-25 my-6" />
    {/if}
    <ArticleCard article="{article}" />
  {:else}
    <p class="text-center">暂无文章</p>
  {/each}
</div>
