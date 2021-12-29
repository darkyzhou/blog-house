<script context="module">
  export async function load({ fetch }) {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    return { props: { articles } };
  }
</script>

<script>
  import { makeTitle, WaterflowController } from '../_utils';
  import ArticleCard from '../../components/ArticleCard.svelte';
  import BackToTop from '../../components/BackToTop.svelte';
  import debounce from 'debounce';

  export let articles;

  let realArticles = articles.filter((p) => !p.isPageArticle);
  let columns = [];
  let controller = new WaterflowController('articles-page', 336, 3, realArticles, (c) => {
    columns = c;
  });

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
  class="my-6 sm:my-8 px-4 sm:px-8 flex gap-6 w-full max-w-300 justify-center"
  bind:this={containerElement}
  use:scrollEvent
  use:controller.observeResize
>
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-4 max-w-[336px]">
      {#each column as article}
        <ArticleCard {article} />
      {/each}
    </div>
  {/each}
</div>

<BackToTop show={showBackToTop} />

<!-- workaround a bug that sveltekit static adapter cannot detect sveltekit:prefetch inside deeply nested <ArticleCard> structures here -->
<div class="hidden">
  {#each realArticles as a}
    <a sveltekit:prefetch href={`/articles/${a.slug}`}>X</a>
  {/each}
</div>
