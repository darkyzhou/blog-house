<script context="module">
  export async function load({ page, fetch }) {
    const tagSlug = page.params.tag;
    const response = await fetch('/data/tags.json');
    const tags = await response.json();
    const targetTag = tags.find((t) => t.slug === tagSlug);
    return { props: { tag: targetTag } };
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

<div class="my-4 sm:my-8 max-w-screen-md mx-auto px-8">
  <div class="my-8 mx-auto max-w-96">
    <TagCard tag="{tag}" displayMode="{true}" />
  </div>
  {#each tag.articles as article, i}
    {#if i}
      <hr class="border-carbonblue-50 mx-auto w-1/2 opacity-25 my-6" />
    {/if}
    <ArticleCard article="{article}" />
  {:else}
    <p class="text-center">暂无文章</p>
  {/each}
</div>
