<script>
  import Nav from '../components/Nav.svelte';
  import Footer from '../components/Footer.svelte';
  import { setContext } from 'svelte';

  export let segment;
</script>

<div class="min-h-screen flex flex-col bg-gray-800">
  <Nav segment="{segment}" />
  <main class="mt-4 flex-grow flex flex-col items-center mb-8">
    <slot />
  </main>
  <Footer />
</div>
