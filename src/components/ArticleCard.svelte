<script>
  import TagsSection from './TagsSection.svelte';
  import ArrowRight24 from 'carbon-icons-svelte/lib/ArrowRight24';

  export let article;
</script>

<a
  sveltekit:prefetch
  href="/articles/{article.slug}"
  class="outline-none border-transparent border-2 focus:border-carbongray-200">
  <article
    class="bg-carbongray-800 p-4 sm:p-6 hover:bg-carbongray-700 cursor-pointer">
    <header>
      <strong class="text-xl sm:text-2xl text-carbonblue-400">
        {article.title}
      </strong>
      {#if article.printDate || article.tags?.length > 0}
        <div class="mt-2 my-4">
          <TagsSection textXs="{true}" article="{article}" />
        </div>
      {/if}
    </header>
    {#if article.excerpt}
      <p class="mt-4 text-xs sm:text-sm text-carbongray-200 break-all leading-relaxed">
        {article.excerpt}
      </p>
    {/if}
    <div class="flex flex-row-reverse mt-2">
      <ArrowRight24 />
    </div>
  </article>
</a>
