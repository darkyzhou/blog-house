<script>
  export let name;
  export let route;
  export let description;
  export let articlesCount;
</script>

<div class="relative flex flex-col justify-between gap-2 text-gray-200 bg-gray-700 px-4 py-3">
  <div class="flex-none flex items-baseline justify-between">
    <h1 class="flex-none text-xl">{name}</h1>
    <a class="text-gray-500 text-sm hover:underline cursor-pointer" href="{route}">{articlesCount} 篇文章</a>
  </div>
  {#if description}
    <p class="flex-grow text-gray-400 text-sm">
      {description}
    </p>
  {/if}
</div>
