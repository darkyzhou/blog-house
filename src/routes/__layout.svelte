<script>
  import Nav from '../components/Nav.svelte';
  import PortalFooter from '../components/PortalFooter.svelte';
  import Footer from '../components/Footer.svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import Analytics from '../components/Analytics.svelte';
  import LoadingProgressIndicator from '../components/LoadingProgressIndicator.svelte';
  import { onMount } from 'svelte';
  import { getStores } from '$app/stores';
  import { page } from '$app/stores';

  const { navigating } = getStores();
  let loading = false;

  onMount(() => {
    navigating.subscribe((val) => (loading = !!val));
  });
</script>

<svelte:head>
  <Analytics
    gaMeasurementId="{basicConfiguration.analytics.gaMeasurementId}"
    baiduId="{basicConfiguration.analytics.baiduId}" />
</svelte:head>

<LoadingProgressIndicator loading="{loading}" />

<div class="fix-100vh flex flex-col text-carbongray-200">
  <Nav class="z-10" />
  <div
    class="flex-grow flex flex-col items-center z-20 {$page.url.pathname !== '/' && 'bg-carbongray-900'}">
    <slot />
  </div>
  {#if $page.url.pathname === '/'}
    <PortalFooter class="z-10" />
  {:else}
    <Footer class="z-10" />
  {/if}
</div>
