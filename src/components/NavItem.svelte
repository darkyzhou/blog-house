<script>
  import Search16 from 'carbon-icons-svelte/lib/Search16';

  let extraClasses;
  export { extraClasses as class };
  export let caption = '';
  export let search = false;
  export let route;
  export let active;
  export let click;
</script>

{#if !search}
  <a
    data-sveltekit-preload-data
    tabindex="0"
    class="grid h-full place-items-center px-2 py-1 md:px-4 md:py-2 text-carbongray-100 outline-none border-transparent hover:border-carbongray-200 focus:border-carbongray-200 border-2 {active &&
      'text-carbongray-600 bg-carbongray-100'} {extraClasses}"
    class:inactive={!active}
    href={route}
  >
    {caption}
  </a>
{:else}
  <span
    tabindex="0"
    class="cursor-pointer grid h-full place-items-center px-2 py-1 md:px-4 md:py-2 text-carbongray-100 outline-none border-transparent hover:border-carbongray-200 focus:border-carbongray-200 border-2 {active &&
      'text-carbongray-600 bg-carbongray-100'} {extraClasses}"
    class:inactive={!active}
    on:click={() => {
      if (click) click();
    }}
  >
    <Search16 />
  </span>
{/if}

<style>
  @supports ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .inactive {
      backdrop-filter: blur(24px) brightness(0.9) saturate(0.9);
      -webkit-backdrop-filter: blur(24px) brightness(0.9) saturate(0.9);
    }
  }

  @supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .inactive {
      background-color: rgba(38, 38, 38, 0.75);
    }
  }
</style>
