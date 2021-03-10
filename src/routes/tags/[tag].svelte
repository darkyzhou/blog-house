<style>
</style>

<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/tags/${params.tag}.json`);
    const data = await response.json();
    if (response.status !== 200) {
      this.error(response.status, data.message);
      return;
    }
    return { tag: data };
  }
</script>

<script>
  import Article from '../../components/Article.svelte';
  import TagCard from '../../components/TagCard.svelte';

  export let tag;
</script>

<div class="max-w-screen-md mx-auto px-8">
  <TagCard
    name="{tag.name}"
    description="{tag.description}"
    showArticlesCount="{false}"
    extraClasses="my-8" />
  {#each tag.posts as post, i}
    {#if i}
      <hr class="border-indigo-50 mx-auto w-1/2 opacity-25" />
    {/if}
    <Article post="{post}" />
  {/each}
</div>
