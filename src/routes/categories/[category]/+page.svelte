<script>
  import ArticleCard from '../../../components/ArticleCard.svelte';
  import CategoryCard from '../../../components/CategoryCard.svelte';
  import BackToTop from '../../../components/BackToTop.svelte';
  import { makeTitle, WaterflowController } from '../../_utils';
  import { debounce } from 'lodash-es';

  export let data;
  let { category } = data;

  let columns = [];
  let controller = new WaterflowController('category-page', 336, 3, category.articles, (c) => {
    columns = c;
  });

  let cardElement;
  let showBackToTop = false;
  let scrollToTopListener;

  function checkShouldScrollToTop() {
    showBackToTop = cardElement?.getBoundingClientRect().top < 0;
  }

  function scrollEvent() {
    scrollToTopListener = debounce(() => checkShouldScrollToTop(), 100);
    document.addEventListener('scroll', scrollToTopListener, false);
    return {
      destroy: () => {
        document.removeEventListener('scroll', scrollToTopListener);
      }
    };
  }
</script>

<svelte:head>
  <title>{makeTitle(`分类：${category.name}`)}</title>
  {#if category.description}
    <meta name="description" content={category.description} />
  {/if}
</svelte:head>

<div class="my-4 sm:my-8 px-8 w-full" use:controller.observeResize use:scrollEvent>
  <div class="my-8 mx-auto max-w-96 min-w-64" bind:this={cardElement}>
    <CategoryCard item={category} displayMode={true} />
  </div>
  <div class="flex gap-6 w-full max-w-300 mx-auto justify-center">
    {#if category.articles?.length <= 0}
      <p class="text-center">暂无文章</p>
    {:else}
      {#each columns as column}
        <div class="flex-1 flex flex-col gap-4 max-w-[336px]">
          {#each column as article}
            <ArticleCard {article} />
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>

<BackToTop show={showBackToTop} />
