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
  $: sorted = tags.sort((a, b) => b.articles.length - a.articles.length)
</script>

<svelte:head>
  <title>{makeTitle('标签')}</title>
</svelte:head>

<TagsContainer items="{sorted}" style="max-width: 1000px;" />
