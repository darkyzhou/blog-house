<style>
  .tag:not(:last-child)::after {
    content: ',';
    padding-right: 8px;
  }
</style>

<script>
  import { getIcon } from './icons';

  export let post;
  export let extraClasses = '';
</script>

<ul class="list-none p-0 text-base text-indigo-100 flex gap-4 font-light {extraClasses}">
  {#if post.printDate}
    <li class="flex items-center gap-1">
      <svelte:component this="{getIcon('calendar')}" extraClasses="w-4 h-4 inline" />
      {post.printDate}
    </li>
  {/if}
  {#if post.tags?.length > 0}
    <li class="flex items-center gap-1">
      <svelte:component this="{getIcon('tag')}" extraClasses="w-4 h-4 inline" />
      {#each post.tags as tag, j}
        <span class="tag">
          {tag}
        </span>
      {/each}
    </li>
  {/if}
</ul>
