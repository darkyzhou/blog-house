<script context="module">
  export async function load({ fetch }) {
    const response = await fetch('/data/categories.json');
    const categories = await response.json();
    return { props: { categories } };
  }
</script>

<script>
  import { makeTitle } from '../_utils';
  import CategoriesContainer from '../../components/CategoriesContainer.svelte';

  export let categories;
  $: sorted = categories.sort((a, b) => b.articles.length - a.articles.length);
</script>

<svelte:head>
  <title>{makeTitle('分类')}</title>
</svelte:head>

<h1 class="w-full max-w-[1000px] mx-auto px-8 md:px-12 pt-4 md:text-xl">
  {#if !sorted.length}
    目前没有分类
  {:else}
    目前有 {sorted.length} 个分类：
  {/if}
</h1>
<CategoriesContainer items={categories} isCategories={true} style="max-width: 1000px;" />

<!-- workaround a bug that sveltekit static adapter cannot detect sveltekit:prefetch inside deeply nested <CategoriesContainer> structures here -->
<div class="hidden">
  {#each sorted as c}
    <a sveltekit:prefetch href={`/categories/${c.slug}`}>X</a>
  {/each}
</div>
