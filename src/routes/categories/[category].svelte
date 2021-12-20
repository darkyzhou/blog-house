<script context="module">
  export async function load({ page, fetch }) {
    const slug = page.params.category;
    const response = await fetch('/data/categories.json');
    const categories = await response.json();
    const target = categories.find((t) => t.slug === slug);
    return { props: { category: target } };
  }
</script>

<script>
  import ArticleCard from '../../components/ArticleCard.svelte';
  import TagCard from '../../components/TagCard.svelte';
  import { makeTitle, WaterflowController } from '../_utils';

  export let category;

  let columns = [];
  let controller = new WaterflowController('category-page', 336, 3, category.articles, (c) => {
    columns = c;
  });
</script>

<svelte:head>
  <title>{makeTitle(`分类：${category.name}`)}</title>
  {#if category.description}
    <meta name="description" content="{category.description}" />
  {/if}
</svelte:head>

<div class="my-4 sm:my-8 px-8 w-full" use:controller.observeResize>
  <div class="my-8 mx-auto max-w-96 min-w-64">
    <TagCard item="{category}" displayMode="{true}" />
  </div>
  <div class="flex gap-6 w-full max-w-300 justify-center">
    {#if category.articles?.length <= 0}
      <p class="text-center">暂无文章</p>
    {:else}
      {#each columns as column}
        <div class="flex-1 flex flex-col gap-4 max-w-[336px]">
          {#each column as article}
            <ArticleCard article="{article}" />
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>
