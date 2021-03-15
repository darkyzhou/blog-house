<style>
  .caption {
    margin: 32px 0 16px 0;
  }

  .list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>

<script context="module">
  export async function preload({ params, query }) {
    const articlesResponse = await this.fetch('/articles/articles.json');
    const articles = await articlesResponse.json();
    const tagsResponse = await this.fetch('/tags/tags.json');
    const tags = await tagsResponse.json();
    return { allArticles: articles, allTags: tags };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import ArticleCard from '../../components/ArticleCard.svelte';
  import TagCard from '../../components/TagCard.svelte';
  import TagsContainer from '../../components/TagsContainer.svelte';

  export let allArticles;
  export let allTags;

  let fetchingIndexes = true;
  let articleIdx, pageIdx, tagIdx;
  let result;

  $: allArticlesMap = new Map(allArticles.map((article) => [article.slug, article]));
  $: allTagsMap = new Map(allTags.map((tag) => [tag.slug, tag]));

  onMount(() => {
    const searchInput = document.getElementById('searchInput');

    fetch('/lunr-indexes.json')
      .then((response) => response.json())
      .then((indexes) => {
        articleIdx = lunr.Index.load(JSON.parse(indexes['article']));
        pageIdx = lunr.Index.load(JSON.parse(indexes['page']));
        tagIdx = lunr.Index.load(JSON.parse(indexes['tag']));
      });

    searchInput.addEventListener('input', () => {
      const criteria = searchInput.value;
      if (!criteria || criteria.trim().length <= 0) {
        result = null;
      } else {
        result = {
          articles: articleIdx.search(criteria).map((result) => allArticlesMap.get(result.ref)),
          pages: pageIdx.search(criteria).map((result) => allArticlesMap.get(result.ref)),
          tags: tagIdx.search(criteria).map((result) => allTagsMap.get(result.ref))
        };
      }
    });
  });
</script>

<svelte:head>
  <script
    src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"
    integrity="sha256-DFDZACuFeAqEKv/7Vnu1Tt5ALa58bcWZegGGFNgET8g="
    crossorigin="anonymous"></script>
</svelte:head>

<div class="mt-4 max-w-screen-md">
  <input
    id="searchInput"
    type="text"
    class="block mx-auto bg-transparent outline-none border-gray-200 border-2 py-2 px-4"
    placeholder="搜索页面、文章、标签..." />

  {#if !result}
    No found
  {:else}
    {#if result.articles?.length > 0}
      <h2 class="caption">文章</h2>
      <ul class="list">
        {#each result.articles as article}
          <li>
            <ArticleCard article="{article}" />
          </li>
        {/each}
      </ul>
    {/if}

    {#if result.pages?.length > 0}
      <h2 class="caption">页面</h2>
      <ul class="list">
        {#each result.pages as page}
          <li>
            <ArticleCard article="{page}" />
          </li>
        {/each}
      </ul>
    {/if}

    {#if result.tags?.length > 0}
      <h2 class="caption">标签</h2>
      <TagsContainer tags="{result.tags}" />
    {/if}
  {/if}
</div>
