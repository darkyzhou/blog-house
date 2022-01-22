<script>
  import basicConfiguration from '../../config/basic-configuration.yml';
  import NavItem from './NavItem.svelte';
  import navConfiguration from '../../config/nav-configuration.yml';
  import { page } from '$app/stores';
  import Search from '../components/Search.svelte';
  import Close32 from 'carbon-icons-svelte/lib/Close32';
  import { removePrerenderPrefix } from '../routes/_utils';
  import { derived } from 'svelte/store';

  const pathName = derived(page, (p) => (p.url ? removePrerenderPrefix(p.url.pathname) : null));

  let extraClasses;
  export { extraClasses as class };

  let searchDialogShown = false;

  function showSearchDialog() {
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.overflow = 'hidden';
    searchDialogShown = true;
  }

  function hideSearchDialog() {
    document.body.style.pointerEvents = 'unset';
    document.body.style.userSelect = 'unset';
    document.body.style.overflow = 'unset';
    searchDialogShown = false;
  }
</script>

<nav
  class="flex flex-col items-center md:items-baseline md:flex-row justify-between gap-2 md:gap-4 py-4 px-4 sm:px-12 mx-auto max-w-[980px] w-full {extraClasses}"
>
  <h1 class="text-carbongray-100 font-bold text-2xl tracking-wider">
    {basicConfiguration.blogName}
  </h1>
  <ul class="md:mx-4 list-none p-0 flex justify-center gap-2 sm:gap-4 text-sm sm:text-base">
    {#each navConfiguration.navItems as item}
      <li>
        {#if item.type === 'home'}
          <NavItem caption={item.caption} route="/" active={!$pathName || $pathName === '/'} />
        {:else if item.type === 'articles'}
          <NavItem
            caption={item.caption}
            route="/articles"
            active={$pathName?.startsWith('/articles')}
          />
        {:else if item.type === 'page'}
          <NavItem
            caption={item.caption}
            route="/{item.slug}"
            active={$pathName?.startsWith('/' + item.slug)}
          />
        {:else if item.type === 'categories'}
          <NavItem
            caption={item.caption}
            route="/categories"
            active={$pathName?.startsWith('/categories')}
          />
        {:else if item.type === 'tags'}
          <NavItem caption={item.caption} route="/tags" active={$pathName?.startsWith('/tags')} />
        {:else if item.type === 'search'}
          <NavItem search={true} active={false} click={() => showSearchDialog()} />
        {/if}
      </li>
    {/each}
  </ul>
</nav>

{#if searchDialogShown}
  <div class="mask z-100 absolute inset-0 grid place-items-center pointer-events-auto">
    <div class="h-[80vh] md:h-[70vh] w-[80vw] max-w-[400px] bg-carbongray-800 relative">
      <div class="absolute top-4 right-4 cursor-pointer z-10" on:click={() => hideSearchDialog()}>
        <Close32 />
      </div>
      <Search />
    </div>
  </div>
{/if}

<style>
  @supports ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .mask {
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
    }
  }

  @supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .mask {
      background-color: rgba(38, 38, 38, 0.75);
    }
  }
</style>
