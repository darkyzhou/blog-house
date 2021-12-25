<script context="module">
  export async function load({ fetch }) {
    const response = await fetch('/data/tags.json');
    const tags = await response.json();
    return { props: { tags } };
  }
</script>

<script>
  import { makeTitle } from '../_utils';
  import TagsContainer from '../../components/TagsContainer.svelte';

  export let tags;
  $: sorted = tags.sort((a, b) => b.articles.length - a.articles.length);
</script>

<svelte:head>
  <title>{makeTitle('标签')}</title>
</svelte:head>

<h1 class="w-full max-w-[1000px] mx-auto px-8 md:px-12 pt-4 md:text-xl">
  {#if !sorted.length}
    目前没有标签
  {:else}
    目前有 {sorted.length} 个标签：
  {/if}
</h1>
<TagsContainer items={sorted} style="max-width: 1000px;" />
