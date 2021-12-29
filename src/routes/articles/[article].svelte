<script context="module">
  export async function load({ page, fetch }) {
    const articleSlug = page.params.article;
    const article = await (await fetch(`/data/articles/${articleSlug}.json`)).json();
    const allArticles = !article.category ? [] : await (await fetch(`/data/articles.json`)).json();
    const articlesOfSameCategories = allArticles.filter(
      (a) => a.category === article.category && a.slug !== article.slug
    );
    return {
      props: {
        article,
        articlesOfSameCategories
      }
    };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import TagsSection from '../../components/TagsSection.svelte';
  import TableOfContent from '../../components/TableOfContent.svelte';
  import BackToTop from '../../components/BackToTop.svelte';
  import { makeTitle } from '../_utils';
  import basicConfiguration from '../../../config/basic-configuration.yml';
  import ClipboardJS from 'clipboard';
  import debounce from 'debounce';
  import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';

  export let article;
  export let articlesOfSameCategories;

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
    scrollToTopListener = debounce(() => checkShouldScrollToTop(), 100);
    document.addEventListener('scroll', scrollToTopListener, false);

    const elements = Array.from(
      document.querySelectorAll(
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((item) => `.markdown-body > ${item}`).join(', ')
      )
    );
    tableOfContentListener = debounce(() => updateHighlightedHeadingIndex(elements), 50);
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

  function padIfAlpha(str) {
    if (str.length > 0 && /^\w/i.test(str)) {
      return ` ${str}`;
    }
    return str;
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
    <meta name="description" content={article.excerpt} />
  {/if}
</svelte:head>

<div
  class="relative text-carbongray-200 lg:p-2 w-screen md:max-w-[500px] lg:max-w-screen-sm xl:max-w-screen-md 2xl:max-w-screen-lg"
  use:scrollEvent
>
  <aside
    class="absolute md:left-[-170px] lg:left-[-210px] top-0 bottom-0 h-full my-10 text-sm hidden md:block md:w-[160px] lg:w-[200px]"
  >
    {#if article.tableOfContent?.length || articlesOfSameCategories?.length}
      <div class="sticky top-0 bg-carbongray-800 max-h-[80vh] flex flex-col">
        {#if article.tableOfContent?.length}
          <div class="flex-none px-4 lg:px-6 py-2 bg-carbongray-700 text-center">大纲</div>
          <div class="flex-1 px-4 lg:px-6 overflow-auto">
            <TableOfContent
              tableOfContent={article.tableOfContent}
              highlightedIndex={highlightedHeadingIndex}
            />
          </div>
        {/if}
        {#if articlesOfSameCategories?.length}
          <div class="bg-carbongray-800">
            <div class="px-4 lg:px-6 py-2 bg-carbongray-700 text-center break-all">
              其它{padIfAlpha(article.category)}文章
            </div>
            <ul class="px-4 lg:px-6 py-2 list-none flex flex-col gap-4 overflow-auto max-h-[15vh]">
              {#each articlesOfSameCategories as a}
                <li>
                  <a href="/articles/{a.slug}" class="hover:underline break-all" target="_blank">
                    {a.title}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
        {#if showBackToTop}
          <div
            class="flex-none flex py-2 justify-center cursor-pointer bg-carbongray-700"
            on:click={backToTop}
          >
            <ArrowUp16 />
            <span class="pl-1">回到顶部</span>
          </div>
        {/if}
      </div>
    {/if}
  </aside>
  <div class="my-4 sm:my-8 px-4">
    <h1 class="text-xl lg:text-2xl text-carbonblue-400 mb-2" bind:this={titleElement}>
      {article.title}
    </h1>
    <TagsSection {article} showTags={true} />
    <article id="article" class="mt-8 mb-24 markdown-body">
      {@html article.html}
    </article>
    <div class="commentsContainer w-full" bind:this={utterancesContainer} />
    <p class="loadingIndicator text-center">评论区加载中</p>
  </div>
</div>

<BackToTop class="md:hidden" show={showBackToTop} />

<style>
  .commentsContainer:empty ~ .loadingIndicator {
    display: block;
  }

  .commentsContainer ~ .loadingIndicator {
    display: none;
  }
</style>
