<script>
  export let item;
  export let displayMode = false;
</script>

<article
  class="relative flex flex-col gap-1 justify-between text-carbongray-100 bg-carbongray-800 outline-none border-transparent border-2 px-4 py-3 {!displayMode &&
    'hover:border-carbongray-200 focus:border-carbongray-200'}"
>
  <header class="flex-none flex items-baseline justify-between">
    <h1>
      {#if displayMode}
        分类：
      {/if}
      {item.name}
    </h1>
    <span class="text-carbongray-400 text-sm">
      {#if item.articles?.length}
        {item.articles.length} 篇文章
      {:else}
        暂无文章
      {/if}
    </span>
  </header>
  <p class="flex-grow text-carbongray-300 text-sm break-all mt-2">
    {item.description || '暂无描述'}
  </p>
</article>
