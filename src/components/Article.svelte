<script>
  import TagsSection from './TagsSection.svelte';

  export let post;
</script>

<article>
  <header>
    <h1 class="mb-2 text-3xl text-indigo-500">
      <a sapper:prefetch href="/{post.slug}">{post.title}</a>
    </h1>
    {#if post.printDate || post.tags?.length > 0}
      <TagsSection post="{post}" />
    {/if}
  </header>
  {#if post.excerpt}
    <p class="mt-2 text-base text-gray-200 break-all leading-relaxed">
      {post.excerpt}
    </p>
  {/if}
</article>
