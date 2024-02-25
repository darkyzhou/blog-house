<script>
  import { balancer } from 'svelte-action-balancer';
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
  import { OVERLAY_SCROLLBAR_SETTINGS_OTHER } from '../../../utils/constants';
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
    const elements = document.querySelectorAll('.markdown pre:not(:empty) + .copy');
    new ClipboardJS(elements, {
      text: (element) => element.parentElement.querySelector('code').textContent
    });
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
  class="contentContainer relative text-carbongray-200 box-border w-full block my-6 md:grid"
  style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)"
  use:scrollEvent
>
  <aside
    class="sticky top-0 justify-self-end text-sm pl-4 min-w-[10rem] max-w-[230px] hidden md:block asideContainer"
  >
    {#if article.tableOfContent?.length || articlesOfSameCategories?.length}
      <div class="bg-carbongray-800 max-h-full flex flex-col">
        {#if article.tableOfContent?.length}
          <div class="flex-none px-4 lg:px-6 py-2 bg-carbongray-600 text-center">大纲</div>
          <OverlayScrollbarsComponent class="flex-1" options={OVERLAY_SCROLLBAR_SETTINGS_OTHER}>
            <TableOfContent
              tableOfContent={article.tableOfContent}
              highlightedIndex={highlightedHeadingIndex}
            />
          </OverlayScrollbarsComponent>
        {/if}
        {#if articlesOfSameCategories?.length}
          <div class="flex-none px-4 lg:px-6 py-2 bg-carbongray-600 grid place-items-center">
            <span class="text-center" use:balancer={{ ratio: 0.2 }}>
              其它{padIfAlpha(article.category)}文章
            </span>
          </div>
          <OverlayScrollbarsComponent class="flex-1" options={OVERLAY_SCROLLBAR_SETTINGS_OTHER}>
            <div class="flex flex-col max-h-[30vh]">
              {#each articlesOfSameCategories as a}
                <div
                  class="w-full px-4 lg:px-6 py-1 border-transparent hover:border-carbongray-200 focus:border-carbongray-200 border-1 cursor-pointer"
                >
                  <a href="/articles/{a.slug}" target="_blank">
                    {a.title}
                  </a>
                </div>
              {/each}
            </div>
          </OverlayScrollbarsComponent>
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
    <h1 class="text-2xl lg:text-3xl mb-2" bind:this={titleElement}>
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

  .asideContainer {
    height: calc(100vh - 76px - 24px - 24px);
  }
</style>
