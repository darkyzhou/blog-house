<style>
  .tagsContainer > li {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: help;
  }

  .icon {
    width: 16px;
    height: 16px;
    display: inline;
    color: var(--bg-indigo-200);
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

  export let post;
  export let extraClasses = '';
</script>

<ul class="tagsContainer list-none p-0 text-sm flex flex-wrap gap-2 sm:gap-4 font-light {extraClasses}">
  {#if post.printDate}
    <li title="发表日期">
      <span class="icon">
        <svelte:component this="{getIcon('calendar')}" />
      </span>
      <span class="text-gray-400 cursor-auto">{post.printDate}</span>
    </li>
  {/if}
  {#if post.lastModifiedAt && !isAtSameDay(post.date, post.lastModifiedAt)}
    <li title="最近修改日期">
      <span class="icon">
        <svelte:component this="{getIcon('pen')}" />
      </span>
      <span class="text-gray-400 cursor-auto">{post.printLastModifiedAt}</span>
    </li>
  {/if}
  <li title="字数与阅读时间">
    <span class="icon">
      <svelte:component this="{getIcon('book')}" />
    </span>
    <span class="text-gray-400">
      {post.wordsCount} 字
      {#if post.readingTime}
        ({post.readingTime} 分钟读完)
      {/if}
    </span>
  </li>
  {#if post.tags?.length > 0}
    <li title="标签">
      <span class="icon">
        <svelte:component this="{getIcon('tag')}" />
      </span>
      {#each post.tags as tag, j}
        <a
          sapper:prefetch
          href="/tags/{constraints.tag.items.find((t) => t.name === tag).slug}"
          class="tag text-gray-400 hover:underline cursor-pointer">
          {tag}
        </a>
      {/each}
    </li>
  {/if}
</ul>
