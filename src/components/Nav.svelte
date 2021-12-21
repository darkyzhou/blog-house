<script>
  import basicConfiguration from '../../config/basic-configuration.yml';
  import NavItem from './NavItem.svelte';
  import navConfiguration from '../../config/nav-configuration.yml';
  import { page } from '$app/stores';

  let extraClasses;
  export { extraClasses as class };
</script>

<nav
  class="flex flex-col items-center md:items-baseline md:flex-row justify-between gap-2 md:gap-4 py-4 px-4 sm:px-12 mx-auto w-full {extraClasses}">
  <h1 class="text-carbongray-100 font-bold text-2xl tracking-wider">
    {basicConfiguration.blogName}
  </h1>
  <ul class="md:mx-4 list-none p-0 flex justify-center gap-2 sm:gap-4 text-sm sm:text-base">
    {#each navConfiguration.navItems as item}
      <li>
        {#if item.type === 'home'}
          <NavItem
            caption="{item.caption}"
            route="/"
            active="{!$page.path || $page.path === '/'}" />
        {:else if item.type === 'articles'}
          <NavItem
            caption="{item.caption}"
            route="/articles"
            active="{$page.path?.startsWith('/articles')}" />
        {:else if item.type === 'page'}
          <NavItem
            caption="{item.caption}"
            route="/{item.slug}"
            active="{$page.path?.startsWith('/' + item.slug)}" />
        {:else if item.type === 'categories'}
          <NavItem
            caption="{item.caption}"
            route="/categories"
            active="{$page.path?.startsWith('/categories')}" />
        {:else if item.type === 'tags'}
          <NavItem
            caption="{item.caption}"
            route="/tags"
            active="{$page.path?.startsWith('/tags')}" />
        {/if}
      </li>
    {/each}
    <!-- <li>
      <NavItem
        searchIcon="{true}"
        route="/search"
        active="{$page.path?.startsWith('/search')}"
        class="h-full" />
    </li> -->
  </ul>
</nav>
