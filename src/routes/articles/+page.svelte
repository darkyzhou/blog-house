<script>
  import { makeTitle, WaterflowController } from '../_utils';
  import ArticleCard from '../../components/ArticleCard.svelte';
  import BackToTop from '../../components/BackToTop.svelte';
  import { debounce, groupBy, sortBy } from 'lodash-es';

  export let data;
  let articles = sortBy(
    Object.entries(
      groupBy(
        data.articles.filter((p) => !p.isPageArticle),
        (article) => {
          return new Date(article.date).getFullYear();
        }
      )
    ),
    ([year]) => -Number.parseInt(year, 10)
  );

  let containerElement;
  let showBackToTop = false;
  let scrollToTopListener;

  function checkShouldScrollToTop() {
    showBackToTop = containerElement?.getBoundingClientRect().top < 0;
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
  <title>{makeTitle('文章')}</title>
</svelte:head>

<div
  class="my-6 sm:my-8 px-4 sm:px-8 flex gap-6 w-full max-w-300 mx-auto justify-center"
  bind:this={containerElement}
  use:scrollEvent
>
  <div class="flex-1 flex flex-col gap-4 max-w-[500px]">
    {#each articles as [year, articlesOfYear]}
      <div class="text-xl">
        {year} 年（{articlesOfYear.length} 篇文章）
      </div>
      <div class="px-2 flex flex-col gap-4">
        {#each articlesOfYear as article}
          <ArticleCard {article} />
        {/each}
      </div>
    {/each}
  </div>
</div>

<BackToTop show={showBackToTop} />

<!-- workaround a bug that sveltekit static adapter cannot detect data-sveltekit-preload-data inside deeply nested <ArticleCard> structures here -->
<div class="hidden">
  {#each articles as a}
    <a data-sveltekit-preload-data href={`/articles/${a.slug}`}>X</a>
  {/each}
</div>
