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

<CategoriesContainer items="{categories}" isCategories="{true}" style="max-width: 1000px;" />
