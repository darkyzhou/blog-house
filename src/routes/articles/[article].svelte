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

<div class="flex text-carbongray-200 w-full sm:w-auto relative" use:scrollEvent>
  <aside class="absolute left-[-220px] top-0 bottom-0 h-full m-4 hidden lg:block max-w-[200px]">
    {#if article.tableOfContent?.length}
      <div class="sticky top-0 overflow-x-hidden overflow-y-auto max-h-[80vh] bg-carbongray-800">
        <div class="px-6 py-4">
          <h1 class="mb-2 font-bold">大纲</h1>
          <TableOfContent
            class="pl-4 w-full"
            style="max-width: 14em; width: max-content; min-width: 8em;"
            tableOfContent="{article.tableOfContent}"
            highlightedIndex="{highlightedHeadingIndex}" />
        </div>
        {#if showBackToTop}
          <div
            class="flex py-2 text-sm justify-center cursor-pointer hover:bg-carbongray-700"
            on:click="{backToTop}">
            <ArrowUp16 />
            <span class="pl-1">回到顶部</span>
          </div>
        {/if}
      </div>
    {/if}
  </aside>
  <div
    class="my-4 sm:my-8 w-full sm:w-auto lg:max-w-screen-sm xl:max-w-screen-md 2xl:max-w-screen-lg flex-grow px-4 sm:px-6">
    <h1 class="text-xl sm:text-2xl md:text-3xl text-carbonblue-400 mb-2" bind:this="{titleElement}">
      {article.title}
    </h1>
    <TagsSection article="{article}" />
    <article id="article" class="mt-4 mb-24 markdown-body">
      {@html article.html}
    </article>
    <div class="commentsContainer w-full" bind:this="{utterancesContainer}"></div>
    <p class="loadingIndicator hidden text-center">评论区加载中...</p>
  </div>
</div>
