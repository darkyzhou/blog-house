<script context="module">
  export async function load({ params, fetch }) {
    const articleSlug = params.page;
    const response = await fetch(`/data/articles/${articleSlug}.json`);
    if (response.ok) {
      const article = await response.json();
      return { props: { article } };
    } else {
      return {
        props: { article: null }
      };
    }
  }
</script>

<script>
  import Article from './articles/[article].svelte';
  import FaceDizzy32 from 'carbon-icons-svelte/lib/FaceDizzy32';

  export let article;
</script>

{#if article}
  <Article article="{article}" />
{:else}
  <p class="mt-12 mx-auto flex flex-col items-center gap gap-2">
    <FaceDizzy32 />
    <span class="pt-4 md:text-xl">文章不存在</span>
  </p>
{/if}
