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
    const articlesResponse = await this.fetch('/data/articles.json');
    const articles = await articlesResponse.json();
    const tagsResponse = await this.fetch('/data/tags.json');
    const tags = await tagsResponse.json();
    return { allArticles: articles, allTags: tags };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import ArticleCard from '../../components/ArticleCard.svelte';
  import TagsContainer from '../../components/TagsContainer.svelte';
  import { getIcon } from '../../components/icons';
  import { makeTitle } from '../_utils';

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
        const newResult = {
          articles: articleIdx.search(criteria).map((result) => allArticlesMap.get(result.ref)),
          pages: pageIdx.search(criteria).map((result) => allArticlesMap.get(result.ref)),
          tags: tagIdx.search(criteria).map((result) => allTagsMap.get(result.ref))
        };
        if (!Object.values(newResult).some((item) => item?.length > 0)) {
          result = null;
        } else {
          result = newResult;
        }
      }
    });
  });
</script>

<svelte:head>
  <title>{makeTitle('搜索')}</title>
</svelte:head>

<div class="mt-4 px-4 max-w-screen-sm">
  <input
    id="searchInput"
    type="text"
    class="block mx-auto bg-transparent outline-none border-gray-200 border-2 py-2 px-4"
    placeholder="搜索页面、文章、标签..." />

  {#if !result}
    <p class="mt-12 mx-auto flex flex-col items-center gap-2">
      <svelte:component this="{getIcon('fish')}" extraClasses="w-12 h-12" />
      <span class="text-xl md:text-2xl">暂无结果</span>
    </p>
  {:else}
    {#if result.articles?.length > 0}
      <h2 class="caption">文章 ({result.articles.length})</h2>
      <ul class="list">
        {#each result.articles as article}
          <li>
            <ArticleCard article="{article}" />
          </li>
        {/each}
      </ul>
    {/if}

    {#if result.pages?.length > 0}
      <h2 class="caption">页面 ({result.pages.length})</h2>
      <ul class="list">
        {#each result.pages as page}
          <li>
            <ArticleCard article="{page}" />
          </li>
        {/each}
      </ul>
    {/if}

    {#if result.tags?.length > 0}
      <h2 class="caption">标签 ({result.tags.length})</h2>
      <TagsContainer tags="{result.tags}" />
    {/if}
  {/if}
</div>
