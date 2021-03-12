<style>
  .homeContainer {
    background: url('/background.jpg') fixed 50% / cover no-repeat;
  }
</style>

<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import constraints from '../../config/constraints.json';

  export let segment;

  // WARNING: DO NOT USE PRETTIER ON THIS FILE
  // BECAUSE IT'S BROKEN PARSING THE CODES INSIDE @html
</script>

<svelte:head>
  {#if constraints.analytics.google.gaMeasurementId}
    {@html `
<script src="https://www.googletagmanager.com/gtag/js?id=${constraints.analytics.google.gaMeasurementId}" async></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', '${constraints.analytics.google.gaMeasurementId}');
</script>`}
  {/if}
  {#if constraints.analytics.baidu.id}
    {@html `<script src="https://hm.baidu.com/hm.js?${constraints.analytics.baidu.id}" async></script>`}
  {/if}
</svelte:head>

<div class="min-h-screen flex flex-col text-gray-200 {!segment ? 'homeContainer' : 'bg-gray-800'}">
  <Nav segment="{segment}" />
  <main class="flex-grow flex flex-col items-center">
    <slot />
  </main>
  <Footer />
</div>
