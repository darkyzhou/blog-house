<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch('/tags/tags.json');
    const data = await response.json();
    return { tags: data };
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

<TagsContainer
  tags="{tags}"
  extraClasses="mt-4 sm:mt-8 px-4 sm:px-8 lg:px-16 w-full flex-grow"
  extraStyles="max-width: 1000px" />
