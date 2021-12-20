<style>
  .commentsContainer:empty ~ .loadingIndicator {
    display: block;
  }
</style>

<script context="module">
  export async function load({ page, fetch }) {
    const articleSlug = page.params.article;
    const response = await fetch(`/data/articles/${articleSlug}.json`);
    const article = await response.json();
    return { props: { article } };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import TagsSection from '../../components/TagsSection.svelte';
  import TableOfContent from '../../components/TableOfContent.svelte';
  import { makeTitle } from '../_utils';
  import basicConfiguration from '../../../config/basic-configuration.yml';
  import ClipboardJS from 'clipboard';
  import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';

  export let article;

  let titleElement;
  let showBackToTop = false;
  let highlightedHeadingIndex = 0;
  let utterancesContainer;
  let scrollToTopListener;
  let tableOfContentListener;

  function checkShouldScrollToTop() {
    showBackToTop = titleElement?.getBoundingClientRect().top < 0;
  }

  function updateHighlightedHeadingIndex(elements = []) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const nextTop = elements[i + 1 >= elements.length ? i : i + 1].getBoundingClientRect().top;
      if (nextTop > 16 || (i === elements.length - 1 && element.getBoundingClientRect().top < 16)) {
        if (highlightedHeadingIndex !== i) {
          highlightedHeadingIndex = i;
          window.history.replaceState(
            window.history.state,
            '',
            `${location.href.split('#')[0]}#${element.id}`
          );
        }
        break;
      }
    }
  }

  function scrollEvent() {
    scrollToTopListener = () => checkShouldScrollToTop();
    document.addEventListener('scroll', scrollToTopListener, false);

    const elements = Array.from(
      document.querySelectorAll(
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((item) => `.markdown-body > ${item}`).join(', ')
      )
    );
    tableOfContentListener = () => updateHighlightedHeadingIndex(elements);
    document.addEventListener('scroll', tableOfContentListener, false);

    return {
      destroy: () => {
        document.removeEventListener('scroll', scrollToTopListener);
        document.removeEventListener('scroll', tableOfContentListener);
      }
    };
  }

  function initUtterances(configuration) {
    const utterances = document.createElement('script');
    const config = Object.entries({
      src: 'https://utteranc.es/client.js',
      repo: configuration.repository,
      'issue-term': configuration.issueTerm,
      label: configuration.label,
      theme: configuration.theme,
      crossOrigin: 'anonymous',
      async: 'true'
    });
    config.forEach(([key, value]) => utterances.setAttribute(key, value));
    utterancesContainer.appendChild(utterances);
  }

  function initCodeCopying() {
    const elements = document.querySelectorAll('.markdown-body pre:not(:empty) .copy');
    elements.forEach((element) => (element.textContent = '复制代码'));
    const clipboard = new ClipboardJS(elements, {
      text: (element) => element.parentElement.querySelector('code').textContent
    });
    clipboard.on('success', (e) => (e.trigger.textContent = '复制成功'));
    clipboard.on('error', (e) => (e.trigger.textContent = '复制失败'));
  }

  function backToTop() {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onMount(() => {
    checkShouldScrollToTop();
    initCodeCopying();
    if (basicConfiguration.comments[0]?.type === 'utterances') {
      initUtterances(basicConfiguration.comments[0]);
    }
  });
</script>

<svelte:head>
  <title>{makeTitle(article.title)}</title>
  {#if article.excerpt}
    <meta name="description" content="{article.excerpt}" />
  {/if}
</svelte:head>

<div
  class="relative text-carbongray-200 px-8 lg:p-2 w-screen md:max-w-[500px] lg:max-w-screen-sm xl:max-w-screen-md 2xl:max-w-screen-lg"
  use:scrollEvent>
  <aside class="absolute md:left-[-160px] lg:left-[-220px] top-0 bottom-0 h-full my-10 hidden md:block md:w-[160px] lg:w-[200px]">
    {#if article.tableOfContent?.length}
      <div class="sticky top-0 bg-carbongray-800 max-h-[80vh] flex flex-col">
        <div class="flex-none text-sm px-4 lg:px-6 py-2 bg-carbongray-700 text-center">
          大纲
        </div>
        <div class="flex-1 px-4 lg:px-6 overflow-auto">
          <TableOfContent
            tableOfContent="{article.tableOfContent}"
            highlightedIndex="{highlightedHeadingIndex}" />
        </div>
        {#if showBackToTop}
          <div
            class="flex-none flex py-2 text-sm justify-center cursor-pointer bg-carbongray-700"
            on:click="{backToTop}">
            <ArrowUp16 />
            <span class="pl-1">回到顶部</span>
          </div>
        {/if}
      </div>
    {/if}
  </aside>
  <div class="my-4 sm:my-8 px-2">
    <h1 class="text-2xl lg:text-3xl text-carbonblue-400 mb-2" bind:this="{titleElement}">
      {article.title}
    </h1>
    <TagsSection article="{article}" />
    <article id="article" class="mt-8 mb-24 markdown-body">
      {@html article.html}
    </article>
    <div class="commentsContainer w-full" bind:this="{utterancesContainer}"></div>
    <p class="loadingIndicator hidden text-center">评论区加载中...</p>
  </div>
</div>
