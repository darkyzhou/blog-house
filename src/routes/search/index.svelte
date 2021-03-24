<style>
  .caption {
    margin: 32px 0 16px 0;
  }

  .list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
</style>

<script context="module">
  export async function preload({ params, query }) {
    const articlesResponse = await this.fetch('data/articles.json');
    const articles = await articlesResponse.json();
    const tagsResponse = await this.fetch('data/tags.json');
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

  let searchInput;
  let fetchingIndexes = true;
  let fetchErrorMessage;
  let articleIdx, pageIdx, tagIdx;

  // undefined represents that user does not have any input yet
  // null represents that the search criteria cannot match any results
  let result = undefined;

  $: allArticlesMap = new Map(allArticles.map((article) => [article.slug, article]));
  $: allTagsMap = new Map(allTags.map((tag) => [tag.slug, tag]));

  function initInputHandler() {
    searchInput.addEventListener('input', () => {
      const criteria = searchInput.value;
      if (!criteria || criteria.trim().length <= 0) {
        result = undefined;
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
  }

  onMount(async () => {
    try {
      const response = await fetch('/lunr-indexes.json');
      const indexes = await response.json();
      articleIdx = lunr.Index.load(JSON.parse(indexes['article']));
      pageIdx = lunr.Index.load(JSON.parse(indexes['page']));
      tagIdx = lunr.Index.load(JSON.parse(indexes['tag']));
      initInputHandler();
    } catch (error) {
      fetchErrorMessage = error.message;
    } finally {
      fetchingIndexes = false;
    }
  });
</script>

<svelte:head>
  <title>{makeTitle('搜索')}</title>
  <script
    src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"
    integrity="sha256-DFDZACuFeAqEKv/7Vnu1Tt5ALa58bcWZegGGFNgET8g="
    crossorigin="anonymous"
    async></script>
</svelte:head>

<div class="pageContainer px-4 max-w-screen-sm">
  <input
    type="text"
    class="{fetchingIndexes || fetchErrorMessage
      ? 'hidden pointer-events-none'
      : 'block'} mx-auto bg-transparent outline-none border-carbongray-200 border-2 py-2 px-4"
    placeholder="搜索页面、文章、标签..."
    bind:this="{searchInput}" />
  {#if fetchingIndexes}
    <p class="mt-12 mx-auto">加载索引中...</p>
  {/if}
  {#if fetchErrorMessage}
    <p class="mt-12 mx-auto flex flex-col items-center c-gap c-gap-2">
      <svelte:component this="{getIcon('dizzyFace')}" extraClasses="w-12 h-12" />
      <span class="text-xl md:text-2xl">加载索引失败</span>
      <span>
        {fetchErrorMessage}
      </span>
    </p>
  {/if}

  {#if !result}
    {#if result !== undefined}
      <p class="mt-12 mx-auto flex flex-col items-center c-gap c-gap-2">
        <svelte:component this="{getIcon('dizzyFace')}" extraClasses="w-12 h-12" />
        <span class="text-xl md:text-2xl">暂无结果</span>
      </p>
    {/if}
  {:else}
    {#if result.articles?.length > 0}
      <h2 class="caption">文章 ({result.articles.length})</h2>
      <ul class="list c-gap c-gap-4">
        {#each result.articles as article}
          <li>
            <ArticleCard article="{article}" />
          </li>
        {/each}
      </ul>
    {/if}

    {#if result.pages?.length > 0}
      <h2 class="caption">页面 ({result.pages.length})</h2>
      <ul class="list c-gap c-gap-4">
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
