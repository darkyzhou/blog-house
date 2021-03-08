<style>
  .tagsContainer > li {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: help;
  }

  .tag:not(:last-child)::after {
    content: ',';
    padding-right: 6px;
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

<ul
  class="tagsContainer list-none p-0 text-base text-indigo-100 flex gap-4 font-light {extraClasses}">
  {#if post.printDate}
    <li title="发表日期">
      <svelte:component this="{getIcon('calendar')}" extraClasses="w-4 h-4 inline" />
      <span class="cursor-auto">{post.printDate}</span>
    </li>
  {/if}
  {#if post.lastModifiedAt && !isAtSameDay(post.date, post.lastModifiedAt)}
    <li title="最近修改日期">
      <svelte:component this="{getIcon('pen')}" extraClasses="w-4 h-4 inline" />
      <span class="cursor-auto">{post.printLastModifiedAt}</span>
    </li>
  {/if}
  {#if post.tags?.length > 0}
    <li title="标签">
      <svelte:component this="{getIcon('tag')}" extraClasses="w-4 h-4 inline" />
      {#each post.tags as tag, j}
        <a
          sapper:prefetch
          href="/tag/{constraints.tag.items.find((t) => t.name === tag).slug}"
          class="tag hover:underline cursor-pointer">
          {tag}
        </a>
      {/each}
    </li>
  {/if}
</ul>
