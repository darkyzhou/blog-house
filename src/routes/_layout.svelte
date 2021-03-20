<style>
  .homeContainer {
    background: url('/background.jpg') fixed 50% / cover no-repeat;
  }

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
</style>

<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import constraints from '../../config/constraints.json';
  import Analytics from '../components/Analytics.svelte';

  export let segment;

  // WARNING: DO NOT USE PRETTIER ON THIS FILE
  // BECAUSE IT'S BROKEN PARSING THE CODES INSIDE @html
</script>

<svelte:head>
  <Analytics
    gaMeasurementId="{constraints.analytics.google.gaMeasurementId}"
    baiduId="{constraints.analytics.baidu.id}" />
</svelte:head>

<div
  class="min-h-screen flex flex-col text-carbongray-200 {!segment ? 'homeContainer' : 'dotsContainer'}">
  {#if segment}
    <span class="dots"></span>
  {/if}
  <Nav segment="{segment}" extraClasses="z-10" />
  <main class="flex-grow flex flex-col items-center z-10">
    <slot />
  </main>
  <Footer extraClasses="z-10" />
</div>
