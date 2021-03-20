<script>
  import { getIcon } from './icons';

  export let extraClasses = '';
  export let extraStyles = '';
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
  style="{!active ? 'backdrop-filter: blur(16px);' : ''} {extraStyles}"
  href="{route}">
  {#if icon}
    <svelte:component this="{getIcon(icon)}" extraClasses="w-4 h-4" />
  {/if}
  {#if caption}
    {caption}
  {/if}
</a>
