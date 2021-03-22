<style>
  .tagsContainer > li {
    display: flex;
    align-items: center;
    cursor: help;
  }

  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
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
  import { getIcon } from './icons';
  import tagsConfiguration from '../../config/tags-configuration.yml';

  export let article;
  let extraClasses;
  export { extraClasses as class };
</script>

<ul
  class="tagsContainer text-sm sm:text-base list-none p-0 flex flex-wrap c-gap c-gap-2 sm:c-gap-4 {extraClasses}">
  {#if article.printDate}
    <li title="发表日期">
      <span class="icon">
        <svelte:component this="{getIcon('calendar')}" />
      </span>
      <span class="text-carbongray-300 cursor-auto">{article.printDate}</span>
    </li>
  {/if}
  {#if article.lastModifiedAt && !isAtSameDay(article.date, article.lastModifiedAt)}
    <li title="最近修改日期">
      <span class="icon">
        <svelte:component this="{getIcon('pen')}" />
      </span>
      <span class="text-carbongray-300 cursor-auto">{article.printLastModifiedAt}</span>
    </li>
  {/if}
  <li title="字数与阅读时间">
    <span class="icon">
      <svelte:component this="{getIcon('book')}" />
    </span>
    <span class="text-carbongray-300">
      {article.wordsCount} 字
      {#if article.readingTime}
        ({article.readingTime} 分钟读完)
      {/if}
    </span>
  </li>
  {#if article.tags?.length > 0}
    <li title="标签">
      <span class="icon">
        <svelte:component this="{getIcon('tag')}" />
      </span>
      {#each article.tags as tag, j}
        {#if tagsConfiguration.tags.some((t) => t.name === tag)}
          <a
            sapper:prefetch
            href="/tags/{tagsConfiguration.tags.find((t) => t.name === tag).slug}"
            class="text-carbongray-300 hover:underline cursor-pointer">
            {tag}
          </a>
        {:else}
          <span class="text-carbongray-300">{tag}</span>
        {/if}

        {#if j < article.tags.length - 1}
          <span class="pl-0.5 pr-2">,</span>
        {/if}
      {/each}
    </li>
  {/if}
</ul>
