<script>
  let extraClasses;
  export { extraClasses as class };
  export let showArticlesCount = true;
  export let tag;
</script>

<article
  class="relative flex flex-col justify-between text-carbongray-100 bg-carbongray-800 px-4 py-3 {extraClasses}">
  <header class="flex-none flex items-baseline justify-between">
    <h1 class="flex-none text-xl" style="max-width: 7em">
      {tag.name}
    </h1>
    {#if showArticlesCount}
      <span class="text-carbongray-400 text-sm">
        {#if tag.articles?.length}
          {tag.articles.length} 篇文章
        {:else}
          暂无文章
        {/if}
      </span>
    {/if}
  </header>
  {#if tag.description}
    <p class="flex-grow text-carbongray-300 text-sm break-all mt-2">
      {tag.description}
    </p>
  {/if}
</article>
