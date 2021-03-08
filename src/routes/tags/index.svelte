<script context="module">
  const TAG_CARD_NORMAL_WIDTH_PX = 200;
  const MAX_COLUMNS_COUNT = 4;
  const tags = [
    {
      name: '编程',
      description: '阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description: '阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description: '阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description:
        '阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸爸爸阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description: '阿爸阿阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description:
        '阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸',
      articlesCount: 23
    },
    {
      name: '编程',
      description: '阿爸阿爸阿爸阿爸阿爸阿爸爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸阿爸',
      articlesCount: 23
    }
  ];
</script>

<script>
  import { onMount } from 'svelte';
  import TagCard from '../../components/TagCard.svelte';

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
    tags.forEach((item, index) => newColumns[index % newColumnCount].push(item));
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

<div
  bind:this="{columnsContainer}"
  class="mt-8 w-full flex-grow flex gap-8 px-8 lg:px-16"
  style="max-width: 1000px">
  {#each columns as column}
    <div class="flex flex-col gap-8 flex-1">
      {#each column as tag}
        <TagCard
          name="{tag.name}"
          description="{tag.description}"
          articlesCount="{tag.articlesCount}" />
      {/each}
    </div>
  {/each}
</div>
