<style>
  .avatar {
    height: auto;
    width: auto;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .card {
      max-width: 250px;
    }

    .avatar {
      max-width: 180px;
      margin: 0 auto;
    }

    .description {
      margin-bottom: 2rem;
    }
  }

  @media (min-width: 769px) {
    .card {
      max-width: 700px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
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
</script>

<svelte:head>
  <title>{constraints.base.blogName}</title>
  {#if constraints.base.description}
    <meta name="description" content="{constraints.base.description}" />
  {/if}
</svelte:head>

<div
  class="my-auto flex flex-col md:grid p-4 md:p-0 gap-2 card"
  style="backdrop-filter: blur(10px);">
  <img alt="头像" class="block avatar" src="avatar.jpg" draggable="false" />
  <div class="flex-grow md:col-span-2 md:p-2 flex flex-col gap-2 justify-between items-center">
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
