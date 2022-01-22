<script>
  import Nav from '../components/Nav.svelte';
  import PortalFooter from '../components/PortalFooter.svelte';
  import Footer from '../components/Footer.svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import Analytics from '../components/Analytics.svelte';
  import LoadingProgressIndicator from '../components/LoadingProgressIndicator.svelte';
  import { onMount } from 'svelte';
  import { getStores, page } from '$app/stores';
  import { removePrerenderPrefix } from './_utils';
  import { derived } from 'svelte/store';

  const pathName = derived(page, (p) => (p.url ? removePrerenderPrefix(p.url.pathname) : null));

  const { navigating } = getStores();
  let loading = false;

  onMount(() => {
    navigating.subscribe((val) => (loading = !!val));
  });
</script>

<svelte:head>
  <Analytics
    gaMeasurementId={basicConfiguration.analytics.gaMeasurementId}
    baiduId={basicConfiguration.analytics.baiduId}
  />
</svelte:head>

<LoadingProgressIndicator {loading} />

<div class="fix-100vh flex flex-col text-carbongray-200">
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
