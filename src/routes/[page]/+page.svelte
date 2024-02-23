<script>
  import Article from '../articles/[article]/+page.svelte'
  import FaceDizzy32 from 'carbon-icons-svelte/lib/FaceDizzy32';

  export let data;
</script>

{#if data}
  <Article {data} />
{:else}
  <p class="mt-12 mx-auto flex flex-col items-center gap gap-2">
    <FaceDizzy32 />
    <span class="pt-4 md:text-xl">文章不存在</span>
  </p>
{/if}
