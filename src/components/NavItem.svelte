<style>
  @supports ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .inactive {
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }
  }

  @supports not ((backdrop-filter: none) or (-webkit-backdrop-filter: none)) {
    .inactive {
      background-color: rgba(38, 38, 38, 0.75);
    }
  }
</style>

<script>
  import { getIcon } from './icons';

  let extraClasses;
  export { extraClasses as class };
  export let caption = '';
  export let icon = '';
  export let route;
  export let active;
</script>

<a
  sapper:prefetch
  tabindex="0"
  class="grid place-items-center px-2 py-1 md:px-4 md:py-2 text-carbongray-100 outline-none border-transparent hover:border-carbongray-200 focus:border-carbongray-200 border-2 {active &&
    'text-carbongray-600 bg-carbongray-100'} {extraClasses}"
  class:inactive="{!active}"
  href="{route}">
  {#if icon}
    <svelte:component this="{getIcon(icon)}" extraClasses="w-4 h-4" />
  {/if}
  {#if caption}
    {caption}
  {/if}
</a>
