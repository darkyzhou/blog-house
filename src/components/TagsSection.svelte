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
    color: var(--bg-carbonblue-200);
    margin-right: 2px;
  }

  .tag:not(:last-child)::after {
    content: ',';
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
  import constraints from '../../config/constraints.json';

  export let article;
  export let extraClasses = '';
</script>

<ul class="tagsContainer list-none p-0 text-sm flex flex-wrap c-gap c-gap-2 sm:c-gap-4 font-light {extraClasses}">
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
        <a
          sapper:prefetch
          href="/tags/{constraints.tag.items.find((t) => t.name === tag).slug}"
          class="tag text-carbongray-300 hover:underline cursor-pointer">
          {tag}
        </a>
      {/each}
    </li>
  {/if}
</ul>
