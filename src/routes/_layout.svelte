<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import constraints from '../../config/constraints.json';

  export let segment;
</script>

<svelte:head>
  {#if constraints.analytics.google.gaMeasurementId}
    <script
      src="https://www.googletagmanager.com/gtag/js?id={constraints.analytics.google
        .gaMeasurementId}"
      async></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
  {/if}
  {#if constraints.analytics.baidu.id}
    <script src="https://hm.baidu.com/hm.js?{constraints.analytics.baidu.id}" async></script>
  {/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-gray-800 text-gray-200">
  <Nav segment="{segment}" />
  <main class="flex-grow flex flex-col items-center">
    <slot />
  </main>
  <Footer />
</div>
