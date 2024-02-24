<script>
  import ArrowRight24 from 'carbon-icons-svelte/lib/ArrowRight24';

  export let item;
  export let displayMode = false;
</script>

<article
  class="relative flex flex-col justify-between text-carbongray-100 bg-carbongray-800 px-4 py-3 {!displayMode &&
    'hover:bg-carbongray-700'}"
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
  {#if !displayMode}
    <div class="flex flex-row-reverse mt-2">
      <ArrowRight24 />
    </div>
  {/if}
</article>
