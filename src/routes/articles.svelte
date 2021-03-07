<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/posts.json`);
    const data = await response.json();
    return { posts: data };
  }
</script>

<script>
  import TagsSection from '../components/TagsSection.svelte';
  import { makeTitle } from './_utils';

  export let posts;

  $: articlePosts = posts.filter((p) => !p.isPageArticle);
</script>

<svelte:head>
  <title>{makeTitle('文章')}</title>
</svelte:head>

<div class="max-w-screen-md mx-auto px-8">
  {#each articlePosts as post, i}
    {#if i}
      <hr class="border-indigo-50 mx-auto w-1/2 opacity-25" />
    {/if}
    <article class="font-noto my-12">
      <header>
        <h1 class="mb-2 text-3xl text-indigo-500">
          <a rel="prefetch" href="/{post.slug}">{post.title}</a>
        </h1>
        {#if post.printDate || post.tags?.length > 0}
          <TagsSection post="{post}" />
        {/if}
      </header>
      {#if post.excerpt}
        <p class="mt-4 text-base text-gray-300 break-all leading-relaxed">
          {post.excerpt}
        </p>
      {/if}
    </article>
  {/each}
</div>
