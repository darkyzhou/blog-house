<script context="module">
  const TAG_CARD_NORMAL_WIDTH_PX = 240;
  const MAX_COLUMNS_COUNT = 4;
</script>

<script>
  import { ResizeObserver } from '@juggle/resize-observer';
  import TagCard from './TagCard.svelte';

  let extraClasses;
  export { extraClasses as class };
  let extraStyles;
  export { extraStyles as style };
  export let tags;

  let columnCount;
  let columns = [tags]; // initialize with tags for ssr because onMount is client-only

  function checkAndUpdateColumns(width) {
    const newColumnCount = Math.min(
      Math.floor(width / TAG_CARD_NORMAL_WIDTH_PX),
      MAX_COLUMNS_COUNT,
      tags.length
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

<div class="flex c-gap c-gap-6 sm:c-gap-8 {extraClasses}" style="{extraStyles}" use:observeResize>
  {#each columns as column}
    <div class="flex-1 flex flex-col c-gap c-gap-4">
      {#each column as tag}
        {#if tag.slug}
          <a
            sveltekit:prefetch
            href="/tags/{tag.slug}"
            class="block outline-none border-transparent hover:border-carbongray-300 focus:border-carbongray-300 border-2">
            <TagCard tag="{tag}" />
          </a>
        {:else}
          <TagCard tag="{tag}" />
        {/if}
      {/each}
    </div>
  {/each}
</div>
