<script context="module">
  export async function load({ fetch }) {
    const response = await fetch('/data/articles.json');
    const articles = await response.json();
    return { props: { articles } };
  }

  const CARD_NORMAL_WIDTH_PX = 336;
  const MAX_COLUMNS_COUNT = 3;
</script>

<script>
  import { makeTitle } from '../_utils';
  import ArticleCard from '../../components/ArticleCard.svelte';
  import { ResizeObserver } from '@juggle/resize-observer';

  export let articles;
  $: filtered = articles.filter((p) => !p.isPageArticle);

  let columnCount;
  let columns = [articles.filter((p) => !p.isPageArticle)];

  function checkAndUpdateColumns(width) {
    const newColumnCount = Math.min(
      Math.floor(width / CARD_NORMAL_WIDTH_PX),
      MAX_COLUMNS_COUNT,
      filtered.length
    );
    if (!width || newColumnCount === columnCount) {
      return;
    }

    const newColumns = Array(newColumnCount)
      .fill(null)
      .map(() => []);
    filtered.forEach((a, index) => newColumns[index % newColumnCount].push(a));
    columnCount = newColumnCount;
    columns = newColumns;
  }

  function observeResize(element) {
    const observer = new ResizeObserver((entries) => {
      const width =
        entries?.[0].contentBoxSize?.[0]?.inlineSize || entries?.[0]?.contentRect?.width;
      checkAndUpdateColumns(width);
    });
    observer.observe(element);
    return {
      destroy: () => observer.disconnect()
    };
  }
</script>

<svelte:head>
  <title>{makeTitle('文章')}</title>
</svelte:head>

<div class="my-6 sm:my-8 px-4 sm:px-8 flex gap-6 w-full max-w-300" use:observeResize>
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-4 px-16 sm:px-2">
      {#each column as article}
        <ArticleCard article="{article}" />
      {/each}
    </div>
  {/each}
</div>
