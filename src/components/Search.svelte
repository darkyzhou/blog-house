<style>
  :global(.highlight span) {
    font-weight: bold;
    color: var(--bg-carbonblue-300);
  }
</style>

<script>
  import { onMount } from 'svelte';
  import debounce from 'debounce';
  import algoliasearch from 'algoliasearch/lite.js';
  import Search24 from 'carbon-icons-svelte/lib/Search24';
  import Warning24 from 'carbon-icons-svelte/lib/Warning24';
  import Calendar16 from 'carbon-icons-svelte/lib/Calendar16';
  import Category16 from 'carbon-icons-svelte/lib/Category16';
  import Pen16 from 'carbon-icons-svelte/lib/Pen16';
  import ArrowRight16 from 'carbon-icons-svelte/lib/ArrowRight16';
  import Document24 from 'carbon-icons-svelte/lib/Document24';
  import Tag24 from 'carbon-icons-svelte/lib/Tag24';
  import Category24 from 'carbon-icons-svelte/lib/Category24';
  import Language24 from 'carbon-icons-svelte/lib/Language24';
  import FaceNeutral32 from 'carbon-icons-svelte/lib/FaceNeutral32';
  import AlgoliaLogo from './AlgoliaLogo.svelte';

  const statistics = __BG__STATISTICS;
  const config = __BG__ALGOLIA;
  const searchConfig = {
    attributesToHighlight: ['-*'],
    attributesToSnippet: ['content:50', 'title'],
    attributesToRetrieve: ['*', '-content'],
    snippetEllipsisText: '……',
    highlightPreTag: '<span>',
    highlightPostTag: '</span>'
  };

  let clientIndex;
  let searchValue = '';
  let func;

  let pending = false;
  let searching = false;
  let error = null;

  let result = {
    empty: true,
    categories: [],
    articles: []
  };

  onMount(() => {
    if (!config.enabled) {
      return;
    }

    if (!config.apiKey || !config.appId || !config.index) {
      console.error('apiKey, apiId or index is not specified');
      error = '搜索配置错误';
      return;
    }

    const client = algoliasearch(config.appId, config.apiKey);
    clientIndex = client.initIndex(config.index);
  });

  function onInput(value) {
    searchValue = value;
    if (!func) {
      func = debounce(async () => {
        if (!searchValue) {
          result = {
            empty: true,
            categories: [],
            articles: []
          };
          return;
        }
        searching = true;
        try {
          const result = await clientIndex.search(searchValue, searchConfig);
          resolveSearchResult(result.hits);
        } catch (err) {
          console.error(err);
          error = err.toString();
        }
        searching = false;
        pending = false;
      }, 1000);
    }
    pending = true;
    func();
  }

  function resolveSearchResult(hits) {
    const newResult = {
      empty: true,
      categories: [],
      articles: []
    };
    // TODO: pages
    if (hits?.length <= 0) {
      result = newResult;
      return;
    }

    newResult.empty = false;
    for (const hit of hits) {
      switch (hit.type) {
        case 'article':
          newResult.articles.push({
            slug: hit.slug,
            title: hit.title,
            category: hit.category,
            printDate: hit.printDate,
            modificationDate: hit.modificationDate,
            tags: !hit.tags ? [] : hit.tags.split(' '),
            snippet: {
              title: hit._snippetResult.title.value,
              content: hit._snippetResult.content.value
            }
          });
          break;
        case 'category':
          newResult.categories.push({
            slug: hit.slug,
            title: hit.title,
            snippet: {
              title: hit._snippetResult.title.value,
              content: hit._snippetResult.content.value
            }
          });
          break;
      }
    }

    result = newResult;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }
</script>

{#if config && config.enabled}
  <div class="h-full flex flex-col">
    <div class="flex-none relative w-full flex px-8 py-4">
      <div class="grid place-items-center absolute top-0 bottom-0 pb-1">
        {#if error}
          <Warning24 />
        {:else}
          <Search24 />
        {/if}
      </div>
      <input
        class="w-full h-10 p-2 pl-8 text-xl bg-transparent outline-none border-t-0 border-l-0 border-r-0 border-b-2 border-b-carbongray-600 focus:border-b-carbongray-400"
        placeholder="{!clientIndex ? '请等待' : '搜索内容'}"
        value="{searchValue}"
        on:input="{(e) => onInput(e.target.value)}" />
      <div class="w-8"></div>
    </div>
    <div class="flex-1 overflow-y-auto">
      {#if !searching && !searchValue}
        <div class="px-4 py-8 h-full flex flex-col justify-between">
          <div class="break-all flex flex-col gap-4 md:gap-6 text-xl items-center text-gray-300">
            <p class="flex gap-2 items-center">
              <Tag24 />
              {statistics.tagsCount} 个标签
            </p>
            <p class="flex gap-2 items-center">
              <Category24 />
              {statistics.categoriesCount} 个分类
            </p>
            <p class="flex gap-2 items-center">
              <Document24 />
              {statistics.articlesCount} 篇文章
            </p>
            <p class="flex gap-2 items-center">
              <Language24 />
              总字数 {statistics.wordsCount}
            </p>
          </div>
          <div class="w-full grid place-items-center">
            <AlgoliaLogo />
          </div>
        </div>
      {:else if !pending && !searching && result.empty}
        <div class="w-full h-full px-4 grid place-items-center">
          <div class="text-center text-xl">
            <div class="mb-2 grid place-items-center">
              <FaceNeutral32 />
            </div>
            什么也没找到
          </div>
        </div>
      {:else}
        {#if result.categories.length > 0}
          <div class="px-4 py-2 mb-1 bg-carbongray-700">
            {result.categories.length} 个分类
          </div>
          {#each result.categories as category}
            <a
              href="/categories/{category.slug}"
              target="_blank"
              class="block bg-carbongray-800 mb-1 px-4 py-1 border-2 border-transparent hover:border-carbongray-200 mr-1">
              <div class="float-right pt-1 pr-1">
                <ArrowRight16 />
              </div>
              <strong class="text-sm md:text-base highlight">
                {@html category.snippet.title}
              </strong>
              <div class="text-xs md:text-sm highlight break-all">
                {@html category.snippet.content}
              </div>
            </a>
          {/each}
        {/if}
        {#if result.articles.length > 0}
          <div class="px-4 py-2 mb-1 bg-carbongray-700">
            {result.articles.length} 篇文章
          </div>
          {#each result.articles as article}
            <a
              href="/articles/{article.slug}"
              target="_blank"
              class="block bg-carbongray-800 mb-1 px-4 py-1 border-2 border-transparent hover:border-carbongray-200 mr-1">
              <div class="float-right pt-1 pr-1">
                <ArrowRight16 />
              </div>
              <strong class="text-sm md:text-base highlight">
                {@html article.snippet.title}
              </strong>
              <div class="p-0 flex flex-wrap gap-1 my-1">
                {#if article.printDate}
                  <div title="发表日期" class="cursor-help flex gap-0.5">
                    <span class="icon">
                      <Calendar16 />
                    </span>
                    <span class="text-carbongray-300 text-xs">
                      {formatDate(article.printDate)}
                    </span>
                  </div>
                {/if}
                {#if article.modificationDate}
                  <div title="最近修改日期" class="cursor-help flex gap-0.5">
                    <span class="icon">
                      <Pen16 />
                    </span>
                    <span class="text-carbongray-300 text-xs">
                      {formatDate(article.modificationDate)}
                    </span>
                  </div>
                {/if}
                {#if article.category}
                  <div title="分类" class="cursor-help flex gap-0.5">
                    <span class="icon">
                      <Category16 />
                    </span>
                    <span class="text-carbongray-300 text-xs">
                      {article.category}
                    </span>
                  </div>
                {/if}
              </div>
              <div class="text-xs md:text-sm highlight break-all">
                {@html article.snippet.content}
              </div>
            </a>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
{/if}
