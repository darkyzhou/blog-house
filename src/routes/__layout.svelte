<style windi:preflights:global windi:safelist:global>
  .dotsContainer {
    background: var(--bg-carbongray-900);
  }

  .dots {
    position: fixed;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' style='enable-background:new 0 0 16 16' xml:space='preserve'%3E%3Crect width='16' fill='none' height='16'/%3E%3Crect x='0' y='0' fill='white' width='1' height='1'/%3E%3C/svg%3E");
    background-size: 16px;
    opacity: 0.25;
  }

  @media (max-width: 640px) {
    .dots {
      background-size: 12px;
    }
  }
</style>

<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import homeConfiguration from '../../config/home-page-configuration.yml';
  import Analytics from '../components/Analytics.svelte';
  import LoadingProgressIndicator from '../components/LoadingProgressIndicator.svelte';
  import { onMount } from 'svelte';
  import { getStores } from '$app/stores';

  export let segment;

  const { navigating } = getStores();
  let loading = false;

  onMount(() => {
    navigating.subscribe((val) => (loading = !!val));
  });

  function makeBackgroundStyle() {
    return `background: url('${homeConfiguration.background}') fixed 50% / cover no-repeat var(--bg-carbongray-900);`;
  }
</script>

<svelte:head>
  <Analytics
    gaMeasurementId="{basicConfiguration.analytics.gaMeasurementId}"
    baiduId="{basicConfiguration.analytics.baiduId}" />
</svelte:head>

<LoadingProgressIndicator loading="{loading}" />

<div
  class="min-h-screen flex flex-col text-carbongray-200 {!segment ? '' : 'dotsContainer'}"
  style="{segment ? '' : makeBackgroundStyle()}">
  {#if segment}
    <span class="dots"></span>
  {/if}
  <Nav segment="{segment}" class="z-10" />
  <main class="flex-grow flex flex-col items-center z-20">
    <slot />
  </main>
  <Footer class="my-4 sm:m-0 z-10" />
</div>
