<script>
  import { makeTitle } from '../_utils';
  import TagsContainer from '../../components/TagsContainer.svelte';

  export let data;
  let { tags } = data;
  let sorted = tags.sort((a, b) => b.articles.length - a.articles.length);
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

<!-- workaround a bug that sveltekit static adapter cannot detect data-sveltekit-preload-data inside deeply nested <TagsContainer> structures here -->
<div class="hidden">
  {#each sorted as t}
    <a data-sveltekit-preload-data href={`/tags/${t.slug}`}>X</a>
  {/each}
</div>
