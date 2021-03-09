<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/posts.json`);
    const data = await response.json();
    return { posts: data };
  }
</script>

<script>
  import { makeTitle } from './_utils';
  import Article from '../components/Article.svelte';

  export let posts;

  $: articlePosts = posts.filter((p) => !p.isPageArticle);
</script>

<svelte:head>
  <title>{makeTitle('文章')}</title>
</svelte:head>

<div class="max-w-screen-md mx-auto mt-4 sm:mt-8 px-4 sm:px-8">
  {#each articlePosts as post, i}
    {#if i}
      <hr class="border-indigo-50 mx-auto w-1/2 opacity-25" />
    {/if}
    <Article post="{post}" />
  {/each}
</div>
