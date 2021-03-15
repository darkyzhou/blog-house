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
  class="grid place-items-center px-4 py-2 text-gray-200 outline-none border-transparent hover:border-gray-300 focus:border-gray-300 border-2 {active &&
    'text-gray-600 bg-gray-200'} {extraClasses}"
  style="{!active ? 'backdrop-filter: blur(16px);' : ''} {extraStyles}"
  href="{route}">
  {#if icon}
    <svelte:component this="{getIcon(icon)}" extraClasses="w-4 h-4" />
  {/if}
  {#if caption}
    {caption}
  {/if}
</a>
