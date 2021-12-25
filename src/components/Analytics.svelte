<script>
  import { onMount } from 'svelte';
  import basicConfiguration from '../../config/basic-configuration.yml';
  import { browser } from '$app/env';

  export let gaMeasurementId;
  export let baiduId;

  let enabled = false;

  onMount(() => {
    enabled =
      !!browser && !basicConfiguration.analytics.blockedDomains?.includes(window.location.hostname);
  });

  // workaround for a stupid vscode svelte plugin bug and a prettier svelte plugin bug,
  // both of them are still not fixed even after a whole fucking year
  function resolve(input) {
    return input.replace(/\\/g, '<');
  }
</script>

{#if enabled}
  {#if gaMeasurementId}
    {@html resolve(`\\script src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}" async>\\/script>
    \\script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '${gaMeasurementId}');
    \\/script>`)}
  {/if}
  {#if baiduId}
    {@html resolve(`\\script src="https://hm.baidu.com/hm.js?${baiduId}" async>\\/script>`)}
  {/if}
{/if}
