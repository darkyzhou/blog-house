<script>
  import constraints from '../../config/constraints.json';
  import config from '../config.json';
  import NavItem from './NavItem.svelte';
  import SearchIcon from './icons/SearchIcon.svelte';

  export let segment;
</script>

<nav class="grid gap-4 py-4 px-4 sm:px-12 mx-auto w-full" style="grid-template-areas: 'stack';">
  <h1 class="justify-self-start text-gray-200 font-bold text-2xl" style="grid-area: stack">
    {constraints.base.blogName}
  </h1>
  <ul
    class="justify-self-center mx-4 list-none p-0 flex justify-center gap-2 sm:gap-4 text-sm sm:text-base"
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
  <NavItem
    icon="search"
    route="/search"
    active="{segment?.startsWith('search')}"
    extraClasses='justify-self-end'
    extraStyles="grid-area: stack;" />
</nav>
