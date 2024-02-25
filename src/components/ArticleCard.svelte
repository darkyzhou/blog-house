<script>
  import TagsSection from './TagsSection.svelte';

  export let article;
</script>

<a data-sveltekit-preload-data href="/articles/{article.slug}" class="block">
  <article
    class="bg-carbongray-800 p-2 sm:p-4 cursor-pointer outline-none border-transparent border-2 hover:border-carbongray-200 focus:border-carbongray-200"
  >
    <header>
      <strong>{article.title}</strong>
      {#if article.printDate || article.tags?.length > 0}
        <div class="my-2">
          <TagsSection textXs={true} showModifiedAt={false} {article} />
        </div>
      {/if}
    </header>
    {#if article.excerpt}
      <p class="text-xs sm:text-sm text-carbongray-300 break-words leading-relaxed">
        {article.excerpt}
      </p>
    {/if}
  </article>
</a>
