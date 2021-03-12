<style>
  .mainContainer {
    background: linear-gradient(to bottom, var(--bg-gray-800), var(--bg-gray-900) 25%);
  }
</style>

<script context="module">
  export async function preload({}) {
    // FIXME: this is a hacky way to make sapper generate static files when running svelte export
    // here is a related mr that might change the situation: https://github.com/sveltejs/sapper/pull/1288
    await this.fetch('sitemap.xml');
    await this.fetch('robots.txt');
  }
</script>

<script>
  import constraints from '../../config/constraints.json';
  import NavButton from '../components/NavButton.svelte';
  import { getIcon } from '../components/icons';
</script>

<svelte:head>
  <title>{constraints.base.blogName}</title>
  {#if constraints.base.description}
    <meta name="description" content="{constraints.base.description}" />
  {/if}
</svelte:head>

<div class="w-full flex-grow flex flex-col items-center mainContainer">
  <div class="my-auto grid gap-8" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
    <img alt="" class="block" src="avatar.jpg" />
    <div class="col-span-2 flex flex-col gap-2 p-1 justify-between items-center">
      <h1 class="text-gray-100 text-3xl">
        {constraints.base.authorName}
      </h1>
      <p class="text-gray-300 flex-grow text-xl">
        {constraints.base.description}
      </p>
      <ul class="list-none pl-0 flex gap-2 text-sm">
        {#each constraints.base.personalInfo as info}
          <li class="mr-2 text-gray-400 flex items-center">
            <svelte:component this="{getIcon(info.type)}" extraClasses="w-4 h-4 inline mr-0.5" />
            {#if info.link}
              <a class="hover:underline" target="_blank" rel="nofollow" href="{info.link}">
                {info.text}
              </a>
            {:else}
              <span>{info.text}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
