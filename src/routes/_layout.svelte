<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import { setContext } from 'svelte';

  export let segment;
</script>

<div class="min-h-screen flex flex-col bg-gray-800 text-gray-200">
  <Nav segment="{segment}" />
  <main class="flex-grow flex flex-col items-center">
    <slot />
  </main>
  <Footer />
</div>
