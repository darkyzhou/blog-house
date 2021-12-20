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
</script>

<svelte:head>
  <title>{makeTitle('标签')}</title>
</svelte:head>

<TagsContainer items="{tags}" style="max-width: 1000px;" />
