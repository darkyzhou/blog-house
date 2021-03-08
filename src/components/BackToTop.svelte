<script>
  import { getIcon } from './icons';
  import { stores } from '@sapper/app';

  export let extraClasses;
  export let show;

  const { page } = stores();
</script>

<a
  class="block w-16 h-16 p-2 bg-gray-600 text-gray-200 grid place-items-center cursor-pointer {show
    ? 'opacity-100'
    : 'opacity-0 pointer-events-none'} {extraClasses}"
  style="transition-property: opacity; transition-duration: 250ms"
  href="{$page.path}#">
  <svelte:component this="{getIcon('up')}" />
</a>
