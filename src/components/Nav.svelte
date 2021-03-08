<script>
  import constraints from '../../config/constraints.json';
  import config from '../config.json';
  import NavItem from './NavItem.svelte';

  export let segment;
</script>

<nav
  class="grid py-4 px-12 mx-auto w-full items-baseline"
  style="grid-template-areas: 'stack'">
  <h1 class="justify-self-start text-gray-200 font-bold text-2xl" style="grid-area: stack">
    {constraints.base.blogName}
  </h1>
  <ul
    class="justify-self-center mx-4 list-none p-0 flex justify-center gap-4"
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
        {/if}
      </li>
    {/each}
  </ul>
  <button class="justify-self-end px-4" style="grid-area: stack">🌜</button>
</nav>
