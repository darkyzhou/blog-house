<script>
  export let extraClasses = '';
  export let showArticlesCount = true;
  export let tag;
</script>

<article
  class="relative flex flex-col justify-between c-gap c-gap-2 text-gray-200 bg-gray-700 px-4 py-3 {extraClasses}">
  <header class="flex-none flex items-baseline justify-between">
    <h1 class="flex-none text-xl" style="max-width: 7em">
      {tag.name}
    </h1>
    {#if showArticlesCount}
      <span class="text-gray-500 text-sm">
        {#if tag.articles?.length}
          {tag.articles.length} 篇文章
        {:else}
          暂无文章
        {/if}
      </span>
    {/if}
  </header>
  {#if tag.description}
    <p class="flex-grow text-gray-400 text-sm break-all">
      {tag.description}
    </p>
  {/if}
</article>
