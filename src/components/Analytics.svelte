<script>
  export let gaMeasurementId;
  export let baiduId;
</script>

{#if gaMeasurementId}
  {@html `
<script src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}" async></script>
<script>
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
