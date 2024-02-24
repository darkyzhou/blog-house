<script>
  export let item;
  export let displayMode = false;
</script>

<article
  class="relative flex flex-col gap-1 justify-between text-carbongray-100 bg-carbongray-800 px-4 py-3 {!displayMode &&
    'hover:bg-carbongray-700'}"
>
  <h1>
    {#if displayMode}
      标签：
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
</article>
