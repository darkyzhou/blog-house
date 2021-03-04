<script context="module">
  export async function preload({ params, query }) {
    const response = await this.fetch(`${params.post}.json`);
    const data = await response.json();
    if (response.status !== 200) {
      this.error(response.status, data.message);
      return;
    }
    return { post: data };
  }
</script>

<script>
  import { onMount } from 'svelte';
  import TagsSection from '../components/TagsSection.svelte';
  import TableOfContent from '../components/TableOfContent.svelte';
  import { makeTitle } from './_utils';
  import BackToTop from '../components/BackToTop.svelte';

  export let post;

  let titleElement;
  let headingElements;
  let showBackToTop = false;
  let highlightedHeadingIndex = 0;

  function checkShouldShowToTop() {
    showBackToTop = titleElement?.getBoundingClientRect().top < 0;
  }

  function updateHighlightedHeadingIndex() {
    if (!headingElements) {
      return;
    }
    headingElements.forEach((element, index) => {
      const top = element.getBoundingClientRect().top;
      if (top < 16) {
        highlightedHeadingIndex = index;
        window.history.replaceState(null, '', `${location.href.split('#')[0]}#${element.id}`);
        return;
      }
    });
  }

  onMount(() => {
    checkShouldShowToTop();

    headingElements = [
      ...document.querySelectorAll(
        ['.markdown-body > h1', 'h2', 'h3', 'h4', 'h5', 'h6'].join(', .markdown-body > ')
      )
    ];
    document.addEventListener(
      'scroll',
      () => {
        checkShouldShowToTop();
        updateHighlightedHeadingIndex();
      },
      false
    );
  });
</script>

<svelte:head>
  <title>{makeTitle(post.title)}</title>
</svelte:head>

<div class="max-w-screen-lg mx-auto px-8 font-noto flex text-gray-300 gap-8">
  <article id="article" class="flex-grow max-w-screen-md">
    <header>
      <h1 class="text-3xl text-indigo-500 mb-2" bind:this="{titleElement}">{post.title}</h1>
      <TagsSection post="{post}" extraClasses="mb-6" />
    </header>
    <div class="markdown-body">
      {@html post.html}
    </div>
  </article>
  {#if post.tableOfContent?.length}
    <aside class="hidden lg:block">
      <div class="sticky top-8 overflow-x-hidden overflow-y-auto">
        <h1 class="mb-2 font-bold">大纲</h1>
        <TableOfContent
          extraClasses="pl-4"
          extraStyles="max-height: 80vh"
          tableOfContent="{post.tableOfContent}"
          highlightedIndex="{highlightedHeadingIndex}" />
      </div>
    </aside>
  {/if}
</div>

<BackToTop extraClasses="fixed bottom-8 left-4" show="{showBackToTop}" />
