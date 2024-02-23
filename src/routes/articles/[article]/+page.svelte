<script>
  import { onMount } from 'svelte';
  import TagsSection from '../../../components/TagsSection.svelte';
  import TableOfContent from '../../../components/TableOfContent.svelte';
  import BackToTop from '../../../components/BackToTop.svelte';
  import { makeTitle } from '../../_utils';
  import basicConfiguration from '../../../../config/basic-configuration.yml';
  import ClipboardJS from 'clipboard';
  import { debounce } from 'lodash-es';
  import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';
  import Giscus from '@giscus/svelte';

  export let data;
  let { article, articlesOfSameCategories } = data;

  const commentConfig = basicConfiguration.comment;

  let titleElement;
  let showBackToTop = false;
  let highlightedHeadingIndex = 0;
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
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((item) => `.markdown > ${item}`).join(', ')
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

  function initCodeCopying() {
    const elements = document.querySelectorAll('.markdown pre:not(:empty) .copy');
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
  });
</script>

<svelte:head>
  <title>{makeTitle(article.title)}</title>
  <meta property="og:title" content={article.title} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content={basicConfiguration.blogName} />
  {#if article.excerpt}
    <meta name="description" content={article.excerpt} />
    <meta name="og:description" content={article.excerpt} />
  {/if}
</svelte:head>

<div
  class="contentContainer relative text-carbongray-200 lg:p-2 box-border w-full block my-4 md:grid"
  style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)"
  use:scrollEvent
>
  <aside class="justify-self-end h-full text-sm pl-4 min-w-[10rem] max-w-[210px] hidden md:block">
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
                <li class="text-center">
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
  <div class="px-4 mx-auto w-full min-w-0 max-w-screen-md">
    <h1 class="text-xl lg:text-2xl text-carbonblue-400 mb-2" bind:this={titleElement}>
      {article.title}
    </h1>
    <TagsSection {article} showTags={true} />
    <article id="article" class="mt-8 mb-24 prose markdown">
      {@html article.html}
    </article>
    {#if commentConfig.type === 'giscus'}
      <Giscus {...commentConfig.config} />
    {/if}
  </div>
  <div class="hidden md:block" />
</div>

<BackToTop class="md:hidden" show={showBackToTop} />

<style>
  @media (max-width: 1080px) {
    .contentContainer {
      grid-template-columns: minmax(0, 1fr) minmax(0, 3fr) minmax(0, 1fr) !important;
    }
  }
</style>
