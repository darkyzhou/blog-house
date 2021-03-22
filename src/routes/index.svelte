<style>
  @supports (backdrop-filter: none) or (-webkit-backdrop-filter: none) {
    .card {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
  }

  @supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .card {
      background-color: rgba(38, 38, 38, 0.75);
    }
  }

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
    transform: scale(-1, 1);
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

<script>
  import basicConfiguration from '../../config/basic-configuration.yml';
  import homePageConfiguration from '../../config/home-page-configuration.yml';
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
  <title>{basicConfiguration.blogName}</title>
  {#if basicConfiguration.description}
    <meta name="description" content="{basicConfiguration.description}" />
  {/if}
</svelte:head>

<input id="checkbox" type="checkbox" class="hidden" />
<div class="my-auto flex flex-row-reverse card">
  <label
    id="toggle"
    for="checkbox"
    class="flex-none w-6 grid place-items-center border-transparent outline-none hover:border-carbongray-300 focus:border-carbongray-300 border-2 cursor-pointer"
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
        class="info py-2 md:py-4 px-3 md:px-6 flex flex-col c-gap c-gap-2 justify-between items-center"
        style="grid-area: b">
        <h1 class="text-carbongray-100 text-xl md:text-2xl">
          {basicConfiguration.authorName}
        </h1>
        <p class="text-carbongray-200 flex-grow text-sm md:text-xl mb-4 md:mb-0">
          {basicConfiguration.description}
        </p>
        <ul class="list-none pl-0 flex c-gap c-gap-2 text-sm">
          {#each homePageConfiguration.contact as info}
            <li class="mr-2 text-carbongray-300 flex leading-none">
              <svelte:component
                this="{getIcon(info.type)}"
                extraClasses="inline-block w-4 h-4 mr-0.5" />
              {#if info.type === 'github'}
                <a
                  class="hover:underline"
                  target="_blank"
                  rel="nofollow"
                  href="https://github.com/{info.text}">
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
      <TabContainer tabContents="{homePageConfiguration.tabsContent}" class="w-full h-full" />
    </div>
  </div>
</div>
