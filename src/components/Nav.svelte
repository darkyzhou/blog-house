<script>
  import constraints from '../../config/constraints.json';
  import config from '../config.json';
  import NavItem from './NavItem.svelte';

  export let segment;
</script>

<nav
  class="flex gap-4 flex-col sm:flex-row items-center sm:items-baseline justify-between py-4 px-4 sm:px-12 mx-auto w-full">
  <h1 class="text-gray-200 font-bold text-2xl">
    {constraints.base.blogName}
  </h1>
  <ul
    class="mx-4 list-none p-0 flex justify-center gap-2 sm:gap-4 text-sm sm:text-base"
    style="grid-area: stack">
    {#each config.nav as item}
      <li>
        {#if item.type === 'home'}
          <NavItem caption="{item.caption}" route="/" active="{!segment}" />
        {:else if item.type === 'articles'}
          <NavItem
            caption="{item.caption}"
            route="/articles"
            active="{segment?.startsWith('articles')}" />
        {:else if item.type === 'page'}
          <NavItem
            caption="{item.caption}"
            route="/{item.slug}"
            active="{segment?.startsWith(item.slug)}" />
        {:else if item.type === 'tags'}
          <NavItem caption="{item.caption}" route="/tags" active="{segment?.startsWith('tags')}" />
        {/if}
      </li>
    {/each}
  </ul>
</nav>
