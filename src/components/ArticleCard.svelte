<script>
  import TagsSection from './TagsSection.svelte';

  export let article;
</script>

<article>
  <header>
    <h1 class="mb-2 text-3xl text-indigo-500">
      <a sapper:prefetch href="/articles/{article.slug}">{article.title}</a>
    </h1>
    {#if article.printDate || article.tags?.length > 0}
      <TagsSection article="{article}" />
    {/if}
  </header>
  {#if article.excerpt}
    <p class="mt-2 text-base text-gray-200 break-all leading-relaxed">
      {article.excerpt}
    </p>
  {/if}
</article>
