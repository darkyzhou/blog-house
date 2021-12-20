<style>
  .tagsContainer > li {
    display: flex;
    cursor: help;
  }

  .tagsContainer > li:not(:last-child) {
    margin-right: 6px;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    color: var(--bg-carbonblue-100);
    margin-right: 4px;
  }
</style>

<script context="module">
  function isAtSameDay(a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDay() === dateB.getDay()
    );
  }
</script>

<script>
  import tagsConfiguration from '../../config/tags-configuration.yml';
  import categoriesConfiguration from '../../config/categories-configuration.yml';
  import Calendar16 from 'carbon-icons-svelte/lib/Calendar16';
  import Category16 from 'carbon-icons-svelte/lib/Category16';
  import Pen16 from 'carbon-icons-svelte/lib/Pen16';
  import Document16 from 'carbon-icons-svelte/lib/Document16';
  import Tag16 from 'carbon-icons-svelte/lib/Tag16';

  export let article;
  export let textXs = false;
  export let showModifiedAt = true;
  export let showTags = false;
</script>

<ul class="tagsContainer list-none p-0 flex flex-wrap gap-0.5">
  {#if article.printDate}
    <li title="发表日期">
      <span class="icon">
        <Calendar16 />
      </span>
      <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
        {article.printDate}
      </span>
    </li>
  {/if}
  {#if showModifiedAt && article.lastModifiedAt && !isAtSameDay(article.date, article.lastModifiedAt)}
    <li title="最近修改日期">
      <span class="icon">
        <Pen16 />
      </span>
      <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
        {article.printLastModifiedAt}
      </span>
    </li>
  {/if}
  <li title="字数">
    <span class="icon">
      <Document16 />
    </span>
    <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">
      {article.wordsCount} 字
    </span>
  </li>
  {#if article.category}
    <li title="分类">
      <span class="icon">
        <Category16 />
      </span>
      <a
        sveltekit:prefetch
        href="/categories/{categoriesConfiguration.categories.find(
          (c) => c.name === article.category
        ).slug}"
        class="text-carbongray-300 hover:underline cursor-pointer {textXs ? 'text-xs' : 'text-sm'}">
        {article.category}
      </a>
    </li>
  {/if}
  {#if showTags && article.tags?.length > 0}
    <li title="标签">
      <span class="icon">
        <Tag16 />
      </span>
      {#each article.tags as tag, j}
        {#if tagsConfiguration.tags.some((t) => t.name === tag)}
          <a
            sveltekit:prefetch
            href="/tags/{tagsConfiguration.tags.find((t) => t.name === tag).slug}"
            class="text-carbongray-300 hover:underline cursor-pointer {textXs
              ? 'text-xs'
              : 'text-sm'}">
            {tag}
          </a>
        {:else}
          <span class="text-carbongray-300 {textXs ? 'text-xs' : 'text-sm'}">{tag}</span>
        {/if}
        {#if j < article.tags.length - 1}
          <span class="pl-0.5 pr-2 {textXs ? 'text-xs' : 'text-sm'}">,</span>
        {/if}
      {/each}
    </li>
  {/if}
</ul>
