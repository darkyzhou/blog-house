<script>
  export let name;
  export let route;
  export let description;
  export let articlesCount;
  export let showArticlesCount = true;
</script>

<article class="relative flex flex-col justify-between gap-2 text-gray-200 bg-gray-700 px-4 py-3">
  <header class="flex-none flex items-baseline justify-between">
    <h1 class="flex-none text-xl" style="max-width: 7em">{name}</h1>
    {#if showArticlesCount}
      <a
        sapper:prefetch
        class="text-gray-500 text-sm hover:underline cursor-pointer"
        href="{route}">
        {#if articlesCount}
          {articlesCount} 篇文章
        {:else}
          暂无文章
        {/if}
      </a>
    {/if}
  </header>
  {#if description}
    <p class="flex-grow text-gray-400 text-sm break-all">
      {description}
    </p>
  {/if}
</article>
