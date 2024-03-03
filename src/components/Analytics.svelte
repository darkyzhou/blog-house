<script>
  import { onMount } from 'svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import { browser } from '$app/environment';

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
</script>

{#if enabled}
  {#if gaMeasurementId}
    {@html `<script src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}" async></script><script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '${gaMeasurementId}');
    </script>`}
  {/if}
  {#if baiduId}
    {@html `<script src="https://hm.baidu.com/hm.js?${baiduId}" async></script>`}
  {/if}
  {#if umamiId}
    {@html `<script defer src="https://analytics.us.umami.is/script.js" data-website-id="${umamiId}"></script>`}
  {/if}
{/if}
