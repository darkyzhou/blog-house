<style>
  .card {
    transition: 600ms transform var(--flip);
  }

  #checkbox:checked ~ .card {
    transform: rotateY(180deg);
  }

  .cardContent {
    transition: transform 300ms step-end;
  }

  #checkbox:checked ~ .card .cardContent {
    transform: rotateY(180deg);
  }

  .cardContent > * {
    transition: opacity 280ms;
  }

  #checkbox:not(:checked) ~ .card .aSideContent,
  #checkbox:checked ~ .card .bSideContent {
    transition-timing-function: var(--flip-second-half);
    transition-delay: 320ms;
  }

  #checkbox:checked ~ .card .aSideContent,
  #checkbox:not(:checked) ~ .card .bSideContent {
    opacity: 0;
    pointer-events: none;
    transition-timing-function: var(--flip-first-half);
    transition-delay: 0ms;
  }

  .avatar {
    width: auto;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .cardContent {
      max-width: 300px;
    }

    .avatar {
      max-height: 160px;
    }

    .aSideContent {
      grid-template-areas:
        'a'
        'b'
        'b';
      justify-items: center;
    }
  }

  @media (min-width: 769px) {
    .cardContent {
      max-height: 220px;
      max-width: 600px;
    }

    .avatar {
      max-height: 220px;
    }

    .aSideContent {
      grid-template-areas: 'a b b';
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
  import config from '../config.json';
  import { getIcon } from '../components/icons';
  import { onMount } from 'svelte';
  import TabContainer from '../components/TabContainer.svelte';

  onMount(() => {
    const toggle = document.getElementById('toggle');
    const checkbox = document.getElementById('checkbox');
    toggle.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Enter') {
          checkbox.click();
        }
      },
      false
    );
    toggle.addEventListener('click', () => toggle.blur(), false);
  });
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
    id="toggle"
    for="checkbox"
    class="flex-none w-6 grid place-items-center border-transparent outline-none hover:border-gray-300 focus:border-gray-300 border-2 cursor-pointer"
    tabindex="0">
    <svelte:component this="{getIcon('right')}" />
  </label>
  <div class="cardContent grid gap-2" style="grid-template-areas: 'stack'">
    <div class="aSideContent px-2 py-4 md:p-0 grid gap-1 md:gap-2" style="grid-area: stack;">
      <img
        alt="头像"
        class="avatar block object-cover"
        src="avatar.jpg"
        draggable="false"
        style="grid-area: a" />
      <div
        class="info py-2 md:py-4 px-3 md:px-6 flex flex-col gap-2 justify-between items-center"
        style="grid-area: b">
        <h1 class="text-gray-100 text-xl md:text-2xl lg:text-3xl">
          {constraints.base.authorName}
        </h1>
        <p class="text-gray-300 flex-grow text-sm md:text-xl mb-4 md:mb-0">
          {constraints.base.description}
        </p>
        <ul class="list-none pl-0 flex gap-2 text-sm">
          {#each constraints.base.personalInfo as info}
            <li class="mr-2 text-gray-400 flex leading-none">
              <svelte:component
                this="{getIcon(info.type)}"
                extraClasses="inline-block w-4 h-4 mr-0.5" />
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
      <TabContainer tabContents="{config.home.cardTabs}" extraClasses="w-full h-full" />
    </div>
  </div>
</div>
