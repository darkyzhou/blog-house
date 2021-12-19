<script>
  import ArrowRight24 from 'carbon-icons-svelte/lib/ArrowRight24';

  export let tag;
  export let displayMode = false;
</script>

<article
  class="relative flex flex-col justify-between text-carbongray-100 bg-carbongray-800 px-4 py-3 {!displayMode &&
    'hover:bg-carbongray-700'}">
  <header class="flex-none flex items-baseline justify-between">
    <h1 class="flex-none text-xl" style="max-width: 7em">
      {tag.name}
    </h1>
    {#if !displayMode}
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
  {#if !displayMode}
    <div class="flex flex-row-reverse mt-2">
      <ArrowRight24 />
    </div>
  {/if}
</article>
