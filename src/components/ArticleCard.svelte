<script>
  import TagsSection from './TagsSection.svelte';

  export let article;
</script>

<article>
  <header>
    <a sapper:prefetch href="/articles/{article.slug}">
      <h1 class="mb-2 text-xl sm:text-2xl text-carbonblue-400 hover:underline">
        {article.title}
      </h1>
    </a>
    {#if article.printDate || article.tags?.length > 0}
      <TagsSection article="{article}" extraClasses="font-light text-sm" />
    {/if}
  </header>
  {#if article.excerpt}
    <p class="mt-2 text-sm sm:text-base text-carbongray-100 break-all leading-relaxed">
      {article.excerpt}
    </p>
  {/if}
</article>
