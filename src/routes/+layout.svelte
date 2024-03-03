<script>
  import 'virtual:uno.css';
  import '@unocss/reset/tailwind-compat.css';
  import 'overlayscrollbars/overlayscrollbars.css';
  import '../styles.css';
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { sample } from 'lodash-es';
  import { OverlayScrollbars } from 'overlayscrollbars';
  import Nav from '../components/Nav.svelte';
  import PortalFooter from '../components/PortalFooter.svelte';
  import Footer from '../components/Footer.svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import Analytics from '../components/Analytics.svelte';
  import LoadingProgressIndicator from '../components/LoadingProgressIndicator.svelte';
  import { onMount } from 'svelte';
  import { getStores, page } from '$app/stores';
  import { removePrerenderPrefix } from './_utils';
  import { derived, get } from 'svelte/store';
  import {
    OVERLAY_SCROLLBAR_SETTINGS_BODY,
    OVERLAY_SCROLLBAR_SETTINGS_OTHER
  } from '../utils/constants';

  const { navigating } = getStores();
  const loading = derived(navigating, (value) => !!value, false);
  const pathName = derived(page, (thePage) => {
    if (!thePage.url) {
      return null;
    }

    return removePrerenderPrefix(thePage.url.pathname);
  });

  let videoElement;

  onMount(() => {
    OverlayScrollbars(document.body, OVERLAY_SCROLLBAR_SETTINGS_BODY);
  });

  const scrollbarHandles = [];

  beforeNavigate(() => {
    videoElement?.pause();

    for (const handle of scrollbarHandles) {
      handle.destroy();
    }
  });

  afterNavigate(() => {
    if (get(pathName) === '/') {
      videoElement?.play();
    }

    for (const element of document.querySelectorAll('.code-wrapper pre')) {
      scrollbarHandles.push(OverlayScrollbars(element, OVERLAY_SCROLLBAR_SETTINGS_OTHER));
    }
  });

  const backgroundOffsets = {
    background_1: ['center', '35%'],
    background_2: ['center', '45%'],
    background_3: ['center', '40%']
  };

  const backgroundName = sample(Object.keys(backgroundOffsets));
</script>

<Analytics
  gaMeasurementId={basicConfiguration.analytics.gaMeasurementId}
  baiduId={basicConfiguration.analytics.baiduId}
  umamiId={basicConfiguration.analytics.umamiId}
/>

<div class="relative z-10">
  <LoadingProgressIndicator loading={$loading} />

  <div class="full-height flex flex-col text-carbongray-200">
    <Nav class="z-10" />
    <div
      class="flex-grow flex flex-col items-center z-20 {!!$pathName &&
        $pathName !== '/' &&
        'bg-carbongray-900'}"
    >
      <slot />
    </div>
    {#if !$pathName || $pathName === '/'}
      <PortalFooter class="z-10" />
    {:else}
      <Footer class="z-10" />
    {/if}
  </div>
</div>

{#if browser}
  <video
    playsinline
    autoplay={$pathName === '/'}
    muted
    loop
    poster="/images/{backgroundName}.jpg"
    class="background-video"
    style="object-position: {backgroundOffsets[backgroundName][0]} {backgroundOffsets[
      backgroundName
    ][1]}"
    bind:this={videoElement}
  >
    <source src="/images/{backgroundName}.webm" type="video/webm" />
    <source src="/images/{backgroundName}.mp4" type="video/mp4" />
  </video>
{/if}

<style>
  .full-height {
    min-height: 100vh;
    min-height: 100dvh;
  }

  .background-video {
    width: 100vw;
    width: 100dvw;
    height: 100vh;
    height: 100dvh;
    position: fixed;
    top: 0;
    left: 0;
    object-fit: cover;
  }
</style>
