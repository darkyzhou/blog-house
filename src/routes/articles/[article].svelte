<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`/articles/${params.article}.json`);
    const data = await response.json();
    if (response.status !== 200) {
      this.error(response.status, data.message);
      return;
    }
    return { article: data };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import TagsSection from '../../components/TagsSection.svelte';
  import TableOfContent from '../../components/TableOfContent.svelte';
  import { makeTitle } from '../_utils';
  import BackToTop from '../../components/BackToTop.svelte';
  import constraints from '../../../config/constraints.json';
  import ClipboardJS from 'clipboard';

  export let article;

  let titleElement;
  let showBackToTop = false;
  let highlightedHeadingIndex = 0;

  let utterancesContainer;

  function checkShouldScrollToTop() {
    showBackToTop = titleElement?.getBoundingClientRect().top < 0;
  }

  function initScrollToTop() {
    document.addEventListener('scroll', () => checkShouldScrollToTop(), false);
    checkShouldScrollToTop();
  }

  function updateHighlightedHeadingIndex(elements = []) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const nextTop = elements[i + 1 >= elements.length ? i : i + 1].getBoundingClientRect().top;
      if (nextTop > 16 || (i === elements.length - 1 && element.getBoundingClientRect().top < 16)) {
        if (highlightedHeadingIndex !== i) {
          highlightedHeadingIndex = i;
          window.history.replaceState(null, '', `${location.href.split('#')[0]}#${element.id}`);
        }
        break;
      }
    }
  }

  function initTableOfContent() {
    const elements = Array.from(
      document.querySelectorAll(
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((item) => `.markdown-body > ${item}`).join(', ')
      )
    );
    document.addEventListener('scroll', () => updateHighlightedHeadingIndex(elements), false);
  }

  function initUtterances() {
    const utterances = document.createElement('script');
    const config = Object.entries({
      src: 'https://utteranc.es/client.js',
      repo: constraints.comment.config.repository,
      'issue-term': constraints.comment.config.issueTerm,
      label: constraints.comment.config.label,
      theme: constraints.comment.config.theme,
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

  onMount(() => {
    initScrollToTop();
    initTableOfContent();
    initUtterances();
    initCodeCopying();
  });
</script>

<svelte:head>
  <title>{makeTitle(article.title)}</title>
</svelte:head>

<div class="max-w-screen-lg w-full mt-4 flex text-gray-300 gap-4">
  <div class="w-full flex-grow px-4 sm:px-6 sm:w-auto">
    <h1 class="text-3xl text-indigo-500 mb-2" bind:this="{titleElement}">
      {article.title}
    </h1>
    <TagsSection article="{article}" extraClasses="mb-6" />
    <article id="article" class="w-full mb-24 markdown-body">
      {@html article.html}
    </article>
    <div class="w-full" bind:this="{utterancesContainer}"></div>
  </div>
  {#if article.tableOfContent?.length}
    <aside class="hidden lg:block px-4">
      <div class="sticky top-8 overflow-x-hidden overflow-y-auto">
        <h1 class="mb-2 font-bold">大纲</h1>
        <TableOfContent
          extraClasses="pl-4 w-full"
          extraStyles="max-height: 80vh; max-width: 14em;"
          tableOfContent="{article.tableOfContent}"
          highlightedIndex="{highlightedHeadingIndex}" />
      </div>
    </aside>
  {/if}
</div>

<BackToTop
  extraClasses="fixed bottom-4 right-4 h-12 w-12 sm:left-4 sm:right-0 md:bottom-8 md:left-8 md:h-16 md:w-16"
  show="{showBackToTop}" />
