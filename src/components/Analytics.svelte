<script>
  import { onMount } from 'svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';

  export let gaMeasurementId;
  export let baiduId;
  export let umamiId;

  let enabled = false;

  onMount(() => {
    enabled = !!browser && !domainBlocked() && !uaBlocked();
  });

  function domainBlocked() {
    return basicConfiguration.analytics.blockedDomains?.includes(window.location.hostname);
  }

  function uaBlocked() {
    const userAgent = navigator.userAgent.toLocaleLowerCase();
    return basicConfiguration.analytics.blockedUAs?.some((ua) => userAgent.includes(ua));
  }

  afterNavigate(() => {
    if (!enabled) {
      return;
    }

    if (window.umami) {
      window.umami.track();
    }
  });
</script>

<svelte:head>
  {#if enabled}
    {#if gaMeasurementId}
      <script src="https://www.googletagmanager.com/gtag/js?id={gaMeasurementId}" async></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', '${gaMeasurementId}');
      </script>
    {/if}
    {#if baiduId}
      <script src="https://hm.baidu.com/hm.js?{baiduId}" async></script>
    {/if}
    {#if umamiId}
      <script
        src="https://analytics.us.umami.is/script.js"
        data-website-id={umamiId}
        async
      ></script>
    {/if}
  {/if}
</svelte:head>
