<style>
  .card {
    will-change: transform;
    transition: 600ms transform;
  }

  .avatar {
    max-height: 220px;
    width: auto;
    object-fit: cover;
  }

  .cardContent {
    transition: transform 300ms step-end;
  }

  #checkbox:checked ~ .card {
    transform: rotateY(180deg);
  }

  #checkbox:checked ~ .card .cardContent {
    transform: rotateY(180deg);
  }

  .cardContent > * {
    will-change: opacity;
    transition-property: opacity;
    transition-duration: 300ms;
    transition-delay: 300ms;
  }

  #checkbox:checked ~ .card .aSideContent {
    opacity: 0;
    pointer-events: none;
    transition-delay: 0ms;
  }

  #checkbox:not(:checked) ~ .card .bSideContent {
    opacity: 0;
    pointer-events: none;
    transition-delay: 0ms;
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
  import { getIcon } from '../components/icons';
  import { onMount } from 'svelte';
  import TabContainer from '../components/TabContainer.svelte';

  onMount(() => {});
</script>

<svelte:head>
  <title>{constraints.base.blogName}</title>
  {#if constraints.base.description}
    <meta name="description" content="{constraints.base.description}" />
  {/if}
</svelte:head>

<input id="checkbox" type="checkbox" class="hidden" />
<div class="my-auto flex flex-row-reverse card" style="backdrop-filter: blur(10px);">
  <label
    for="checkbox"
    class="flex-none w-6 grid place-items-center border-transparent hover:border-gray-300 border-2">
    <svelte:component this="{getIcon('right')}" />
  </label>
  <div class="p-4 md:p-0 grid gap-2 cardContent" style="grid-template-areas: 'stack'">
    <div class="aSideContent grid gap-2" style="grid-area: stack; grid-template-areas: 'a b b';">
      <img
        alt="头像"
        class="avatar block object-cover"
        src="avatar.jpg"
        draggable="false"
        style="grid-area: a" />
      <div
        class="info py-4 px-6 flex flex-col gap-2 justify-between items-center"
        style="grid-area: b">
        <h1 class="text-gray-100 text-xl md:text-2xl lg:text-3xl">
          {constraints.base.authorName}
        </h1>
        <p class="text-gray-300 flex-grow text-sm md:text-xl description">
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
    <div class="bSideContent" style="grid-area: stack;">
      <TabContainer extraClasses="w-full h-full ml-4" />
    </div>
  </div>
</div>
