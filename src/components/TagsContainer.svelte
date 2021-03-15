<script context="module">
  const TAG_CARD_NORMAL_WIDTH_PX = 220;
  const MAX_COLUMNS_COUNT = 4;
</script>

<script>
  import { onMount } from 'svelte';
  import TagCard from './TagCard.svelte';

  export let extraClasses = '';
  export let extraStyles = '';
  export let tags;

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
    const observer = new ResizeObserver((entries) =>
      checkAndUpdateColumns(entries?.[0].contentBoxSize?.[0].inlineSize)
    );
    observer.observe(columnsContainer);
  });
</script>

<div
  bind:this="{columnsContainer}"
  class="flex gap-6 sm:gap-8 {extraClasses}"
  style="{extraStyles}">
  {#each columns as column}
    <div class="flex-1 flex flex-col gap-6 sm:gap-8">
      {#each column as tag}
        <TagCard tag="{tag}" />
      {/each}
    </div>
  {/each}
</div>
