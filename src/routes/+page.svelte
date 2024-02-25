<script>
  import basicConfiguration from '../../config/basic-configuration.yml';
  import homePageConfiguration from '../../config/home-page-configuration.yml';
  import { onMount } from 'svelte';
  import TabContainer from '../components/TabContainer.svelte';
  import ArrowsHorizontal20 from 'carbon-icons-svelte/lib/ArrowsHorizontal20';
  import { getOptimizedImageName } from './_utils';

  // must be right after the imports
  const ICONS = []; //@MARK:CONTACTS

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
  <title>{basicConfiguration.blogName}</title>
  {#if basicConfiguration.description}
    <meta name="description" content={basicConfiguration.description} />
  {/if}
</svelte:head>

<input id="checkbox" type="checkbox" class="hidden" />
<div class="my-auto flex flex-row-reverse card">
  <label
    id="toggle"
    for="checkbox"
    class="flex-none w-8 grid place-items-center border-transparent outline-none hover:border-carbongray-300 focus:border-carbongray-300 border-2 cursor-pointer"
    tabindex="0"
  >
    <span class="rotate-45 transform">
      <ArrowsHorizontal20 />
    </span>
  </label>
  <div class="cardContent">
    <div class="aSideContent px-2 py-4 md:p-0 grid gap-1 md:gap-2">
      <picture>
        <source
          srcset={getOptimizedImageName(homePageConfiguration.avatar, 'avif')}
          type="image/avif"
        />
        <source
          srcset={getOptimizedImageName(homePageConfiguration.avatar, 'webp')}
          type="image/webp"
        />
        <img
          class="avatar block object-cover"
          style="grid-area: a"
          alt="头像"
          src={getOptimizedImageName(homePageConfiguration.avatar, 'jpg')}
          draggable="false"
        />
      </picture>
      <div class="info py-2 md:py-4 px-3 md:px-6 flex flex-col gap-2 justify-between items-center">
        <h1 class="text-carbongray-100 text-xl md:text-2xl">
          {basicConfiguration.authorName}
        </h1>
        <p class="text-carbongray-200 flex-grow text-sm md:text-xl mb-4 md:mb-0">
          {basicConfiguration.description}
        </p>
        <ul class="list-none pl-0 flex gap-2 text-sm">
          {#each homePageConfiguration.contact as info, i}
            <li class="mr-2 text-carbongray-300 flex leading-none items-end">
              <span class="inline-block mr-1">
                <svelte:component this={ICONS[i]} />
              </span>
              {#if info.type.includes('Github')}
                <a
                  class="hover:underline"
                  target="_blank"
                  rel="nofollow"
                  href="https://github.com/{info.text}"
                >
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
      <TabContainer tabContents={homePageConfiguration.tabsContent} class="w-full h-full" />
    </div>
  </div>
</div>

<!-- workaround for sveltekit static adapter to generate static files that are not neccessarily "used" (referenced by links) -->
<div class="hidden">
  <a data-sveltekit-preload-data href="/sitemap.xml">X</a>
  <a data-sveltekit-preload-data href="/robots.txt">X</a>
  <a data-sveltekit-preload-data href="/rss.xml">X</a>
  <a data-sveltekit-preload-data href="/manifest.json">X</a>
</div>

<style>
  @supports (backdrop-filter: none) or (-webkit-backdrop-filter: none) {
    .card {
      backdrop-filter: blur(12px) brightness(0.9) saturate(0.9);
      -webkit-backdrop-filter: blur(12px) brightness(0.9) saturate(0.9);
    }
  }

  @supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .card {
      background-color: rgba(38, 38, 38, 0.75);
    }
  }

  .card {
    transition: 600ms transform cubic-bezier(0.65, 0, 0.35, 1);
  }

  #checkbox:checked ~ .card {
    transform: rotateY(180deg);
  }

  .cardContent {
    display: grid;
    grid-template-areas: stack;
    transition: transform 300ms step-end;
  }

  #checkbox:checked ~ .card .cardContent {
    transform: scale(-1, 1);
  }

  .cardContent > * {
    grid-area: stack;
    transition: opacity 280ms;
    will-change: opacity;
  }

  #checkbox:not(:checked) ~ .card .aSideContent,
  #checkbox:checked ~ .card .bSideContent {
    opacity: 1;
    transition-timing-function: cubic-bezier(0, 0.65, 0.4, 0.8);
    transition-delay: 320ms;
  }

  #checkbox:checked ~ .card .aSideContent,
  #checkbox:not(:checked) ~ .card .bSideContent {
    opacity: 0;
    pointer-events: none;
    transition-timing-function: cubic-bezier(0.65, 0, 0.8, 0.4);
    transition-delay: 0ms;
  }

  .avatar {
    width: auto;
    object-fit: cover;
    filter: brightness(0.75) saturate(0.9);
  }

  @media (max-width: 340px) {
    .card {
      margin: auto 18px;
    }

    .cardContent > * {
      height: 280px;
    }

    .avatar {
      max-height: 120px;
    }
  }

  @media (min-width: 341px) and (max-width: 768px) {
    .cardContent > * {
      width: 300px;
      height: 320px;
    }

    .avatar {
      max-height: 160px;
    }
  }

  @media (max-width: 768px) {
    .aSideContent {
      grid-template-areas:
        'a'
        'b'
        'b';
      justify-items: center;
    }
  }

  @media (min-width: 769px) {
    .cardContent > * {
      height: 220px;
      width: 600px;
    }

    .avatar {
      height: 220px;
    }

    .aSideContent {
      grid-template-areas: 'a b b';
    }
  }
</style>
