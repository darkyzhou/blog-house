<script context="module">
  const TAG_CARD_NORMAL_WIDTH_PX = 220;
  const MAX_COLUMNS_COUNT = 4;

  export async function preload({ params, query }) {
    const response = await this.fetch(`/tags/tags.json`);
    const data = await response.json();
    return { tags: data };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import TagCard from '../../components/TagCard.svelte';
  import { makeTitle } from '../_utils';
  import { stores } from '@sapper/app';

  export let tags;

  const { page } = stores();

  let columnsContainer;
  let columnCount;
  let columns = [];

  function checkAndUpdateColumns(width) {
    const newColumnCount = Math.min(
      Math.floor(width / TAG_CARD_NORMAL_WIDTH_PX),
      MAX_COLUMNS_COUNT
    );
    if (!width || newColumnCount === columnCount) {
      return;
    }

    const newColumns = Array(newColumnCount)
      .fill(null)
      .map(() => []);
    tags.forEach((tag, index) => newColumns[index % newColumnCount].push(tag));
    columnCount = newColumnCount;
    columns = newColumns;
  }

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      checkAndUpdateColumns(entries?.[0].contentBoxSize?.[0].inlineSize);
    });
    observer.observe(columnsContainer);
  });
</script>

<svelte:head>
  <title>{makeTitle('标签')}</title>
</svelte:head>

<div
  bind:this="{columnsContainer}"
  class="mt-8 w-full flex-grow flex gap-8 px-8 lg:px-16"
  style="max-width: 1000px">
  {#each columns as column}
    <div class="flex flex-col gap-8 flex-1">
      {#each column as tag}
        <TagCard
          name="{tag.name}"
          route="{$page.path}/{tag.slug}"
          description="{tag.description}"
          articlesCount="{tag.posts.length}" />
      {/each}
    </div>
  {/each}
</div>
