<script>
  import { getIcon } from './icons';

  let extraClasses;
  export { extraClasses as class };
  export let show;

  function backToTop() {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
</script>

<div
  class="block z-20 p-2 bg-carbongray-600 text-carbongray-100 grid place-items-center cursor-pointer {show
    ? 'opacity-90'
    : 'opacity-0 pointer-events-none'} {extraClasses}"
  style="transition-property: opacity; transition-duration: 250ms"
  on:click="{backToTop}">
  <svelte:component this="{getIcon('up')}" />
</div>
